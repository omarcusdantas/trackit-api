# TrackIt API
An api built with Javascript, Express and MongoDB to track and manage user's habits.

## :speech_balloon: Description
This project contains all the files for an API called TrackIt.

* /signup and /signin post endpoints to handle user creation and session. 
* /habits route with post, get and delete endpoints to handle users habits.
* /daily-activities with get and put endpoints to handle user daily activities.
* /history get endpoint to retrieve user history.
* /update post endpoint to update user data.

## ✨ Features
* Users can add, remove and track habits.
* Express for api structure, error handling and limiting requests.
* MongoDB for data persistance.
* Http-status for response padronization.
* String-strip-html to prevent malicious actions.
* JWT and Bcrypt to handle user session and password.
* Joi to validate body on post endpoints;

## :computer: Usage
* Make the http requests to [https://trackit-api.cyclic.app/](https://trackit-api.cyclic.app/) or run the project locally.
* Get information about all routes on Postman: [https://documenter.getpostman.com/view/28914967/2s9XxwxF2j](https://documenter.getpostman.com/view/28914967/2s9XxwxF2j).
* To run the project locally, clone or download the repository. Run a MongoDB server.
* Set the .env file using the .env.example as model. Run the following commands on the root of the project and then you will be able to make the http requests to your local server.
```
npm i
npm run dev
```

## :world_map: Routes
All the routes are documented on Postman: [https://documenter.getpostman.com/view/28914967/2s9XxwxF2j](https://documenter.getpostman.com/view/28914967/2s9XxwxF2j)

## :rocket: Deployment
The project is deployed on [https://trackit-api.cyclic.app/](https://trackit-api.cyclic.app/)

## :bulb: Contributing
This project is currently not open for contributions. However, you are welcome to fork the repository and make modifications for personal use.

## :memo: License
This project is released under the MIT License.

## :books: Credits
This project was created as a practice project by Marcus Dantas.