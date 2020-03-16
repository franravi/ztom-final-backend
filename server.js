const express			=	require('express')
const bodyParser	=	require('body-parser')
const bcrypt			= require('bcrypt-nodejs')
const cors				= require('cors')

const app	=	express();

app.use(bodyParser.json());
app.use(cors());

const database	=
{
	users:
	[	{	id:			'123'
		,	name:		'John'
		,	email:		'john@gmail.com'
		,	password:	'cookies'
		,	entries:	0
		,	joined:		new Date()
		}
	,	{	id:			'124'
		,	name:		'Sally'
		,	email:		'sally@gmail.com'
		,	password:	'cookies'
		,	entries:	0
		,	joined:		new Date()
		}
	]
,	login:
	[ { id: "123"
		, hash: ''
		, email: 'john@gmail.com'
	  }
	]
}

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

	const { email, password } = req.body;

/*
	TO BE USED WHEN IMPLEMENTING DBS:
	bcrypt.compare(password, null, null, function(err,hash) {
		console.log('hashed password',hash);
	})
*/

	if	(		(database.users[0].email		===	email)
			&&	(database.users[0].password	===	password)
			)
	{
		console.log('signin response', database.users[0])

		res.json(database.users[0]);
	}
	else
	{
		res.status(400).json('Error logging in');
	}
})

app.post('/register', (req, res) => {
	console.log('register request', req.body)

	const { email, name, password } = req.body;

	database.users.push(
		{	id:				'125'
		,	name:			name
		,	email:		email
		,	password:	password
		,	entries:	0
		,	joined:		new Date()
		}
	)

	console.log('register response', database.users[database.users.length-1])

	res.json(database.users[database.users.length-1]);
})

app.get('/profile/:id', (req, res) => {
	console.log('profile request', req.params)

	const { id }	=	req.params;
	let found		=	false;

	database.users.forEach(user =>
	{
		if (user.id === id)
		{
			found	=	true;

			return	res.json(user);
		}
	})
	if	(!found)
	{
		res.status(404).json('no such user');
	}
})

app.put('/image', (req, res) => {
	console.log('image request', req.body)

	//	TODO: This whole chunk repeats code from app.get('/profile/:id'), so it is candidate
	//  			to be sent to its own function.
	//
	const { id }	=	req.body;
	let found			=	false;

	database.users.forEach(user =>
	{
		if (user.id === id)
		{
			found	=	true;
			user.entries++;

			return	res.json(user.entries);
		}
	})
	if	(!found)
	{
		res.status(404).json('no such user');
	}
})

app.listen(3000, ()=> {
	console.log('app is running on port 3000');
})
