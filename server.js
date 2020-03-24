const express			=	require('express')
const bodyParser	=	require('body-parser')
const bcrypt			= require('bcrypt-nodejs')
const cors				= require('cors')
const knex        = require('knex')

const db	= 	knex ({ client:     	'pg'
     								, connection: 	{ host : '127.0.0.1'
                      							, user : 'user'
                      							, password : 'password'
                      							, database : 'smart-brain'
                      							}
      							});

console.log(db.select('*').from('users'))

const app	=	express();

app.use(bodyParser.json());
app.use(cors());

/*
**  Pages we want to create as end-points:
**

/ 					--> res		=	this is working
/signin				--> POST	=	success/fail
/register			--> POST	=	user object
/profile/:userId	-->	GET		=	user object
/image				--> PUT		=	user object ??

**
**  We can use postman to be testing them.
**
*/

app.get('/', (req, res)=> {
//	res.send('this is working');
	res.send(database.users);
})

app.post('/signin', (req, res)=> {
	console.log('signin request', req.body)

	// 	This one does not need to be a transaction, as it is not doing changes on db.
	//
	db
		.select('email', 'hash')
		.from('login')
		.where('email', '=', req.body.email)
		.then(data => {
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash)

			if (isValid)
			{
				return db
								.select('*')
								.from('users')
								.where('email', '=', req.body.email)
								.then(user => {
									res.json(user[0])
								})
								.catch(err => res.status(400).json('unable to get user'))
			}
			else
			{
				res.status(400).json('wrong credentials')
			}
		})
		.catch(err => res.status(400).json('wrong credentials'))
})

/*
**  POST: /register	-	Handles the post request to register new users.
*/
app.post('/register', (req, res) => {
	console.log('register request', req.body)

	const { email, name, password } = req.body;
	const hash = bcrypt.hashSync(password);

	//	We need to execute a transaction, two queries with data from the first one that is
	//  required in the second one, and if at least one of them fails, both must be rolled 
	//  back.  The trick here is the use of db.transaction(), with the trx.commit and the
	//	trx.rollback actions.
	//
	db
		.transaction(trx => {
			trx
				.insert({	hash: 	hash
								, email: 	email
								})
				.into('login')
				.returning('email')
				.then(loginEmail => {
					return trx('users')
									.returning('*')
									.insert({ email:  loginEmail[0]
													, name:   name
													, joined: new Date()
													})
									.then(user => {
										res.json(user[0]);
									})
				})
				.then(trx.commit)
				.catch(trx.rollback)
		})
		//.catch(err => res.status(400).json(err))					//  Replaced, this returns db info
																												//    to user.
		.catch(err => res .status(400)
											.json('Unable to register')
					)																							//	Safer, no sensitive data.
})

/*
**  GET: /profile/:id 	- Handles the get request to obtain data from a specific user.
*/
app.get('/profile/:id', (req, res) => {
	console.log('profile request', req.params)

	const { id }	=	req.params;

	db.select('*')
		.from('users')
		.where(	{	id: id })
		.then(user => {
			//  Since empty results are still valid result, we have to analyse it here in order to
			//  decide if we found the value (and return it), or send a 'not found' error message.
			//
			if  (user.length)
			{
				res.json(user[0])
			}
			else
			{
				res.status(400).json('Not found')
			}
		})
		//
		//  For any other errors, we still keep the catch here.
		//
		.catch(err => res.status(400).json('Error getting user'))
})

/*
**  PUT: /image 	- Handles the put request to upload and process an image.
*/
app.put('/image', (req, res) => {
	console.log('image request', req.body)

	const { id }	=	req.body;

	db('users')
		.where('id', '=', id)
		.increment('entries', 1)
		.returning('entries')
		.then(entries => {
			res.json(entries[0])
		})
		.catch(err => res.status(400).json('Unable to get entries'))
})

/*
**  We setup the app to listen on port 3000.
*/
app.listen(3000, ()=> {
	console.log('app is running on port 3000');
})
