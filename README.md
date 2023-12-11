# [TrackIt API](https://trackit-api.cyclic.app/health)
A REST Api built with Typescript, Express and MongoDB to track and manage users habits.

## :speech_balloon: Description
This project contains all the files for an API called TrackIt.

* /signup and /signin post endpoints to handle user creation and session. 
* /habits route with post, get and delete endpoints to handle user habits.
* /daily-activities with get and put endpoints to handle user daily activities.
* /history get endpoint to retrieve user history.
* /users/update post endpoint to update users data (habits and history).

## :rocket: Deployment
The project is deployed on [https://trackit-api.cyclic.app/](https://trackit-api.cyclic.app/health)

## ✨ Tech
* [NodeJS](https://nodejs.org/) as the Javascript Runtime.
* [ExpressJS](https://expressjs.com/) for api structure, [error handling](https://github.com/davidbanham/express-async-errors) and [limiting requests](https://github.com/express-rate-limit/express-rate-limit).
* [MongoDB](https://www.mongodb.com/) for data persistance.
* [String-strip-html](https://www.npmjs.com/package/string-strip-html) to prevent XSS attacks.
* [JWT](https://github.com/auth0/node-jsonwebtoken) and [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) to handle user session token and password encryption.
* [Joi](https://joi.dev/) to validate body on post endpoints;

## :computer: Usage
* Make the https requests to [https://trackit-api.cyclic.app/](https://trackit-api.cyclic.app/) or run the project locally.
* Get information about all routes on Postman: [https://documenter.getpostman.com/view/28914967/2s9XxwxF2j](https://documenter.getpostman.com/view/28914967/2s9XxwxF2j).
* To run the project locally, clone or download the repository. Run a MongoDB server.
* Set the .env file using the [.env.example](.env.example) as model. Run the following commands on the root of the project and then you will be able to make the http requests to your local server.
```
npm i
npm run dev
```

## :world_map: Routes
All the routes are documented on Postman: [https://documenter.getpostman.com/view/28914967/2s9XxwxF2j](https://documenter.getpostman.com/view/28914967/2s9XxwxF2j)

## :bulb: Contributing
This project is currently not open for contributions. However, you are welcome to fork the repository and make modifications for personal use.

## :memo: License
This project is released under the MIT License.

## :books: Credits
This project was created as a practice project by Marcus Dantas.