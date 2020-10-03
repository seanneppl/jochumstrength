# Jochum Strength Insider
![JSMochup](https://user-images.githubusercontent.com/38054153/94626719-406f3a00-0281-11eb-8933-c3426c842b3e.jpg)

Jochum Strength Insider is a JAMstack personal trainer web application.

The application lets an admin or personal trainer set, store, and edit workout for a user. It also allows the admin to follow a users progress and chat with them one on one.

Non admin users can track week to week progress for each exercise on their workout, track their weight monthly, and input/track their daily diet.

The site is built using ReactJS as the frontend framework and Firebase as the backend and is hosted on Heroku.

## Features

### User
*  Personalized workout program

![user-homepage](https://user-images.githubusercontent.com/38054153/94626734-47964800-0281-11eb-96e3-398049d45a32.jpg)
![user-workout-detail](https://user-images.githubusercontent.com/38054153/94626738-4bc26580-0281-11eb-833e-ff69a7cdc816.jpg)

* Weight and diet tracking

![user-weigh-in-chart](https://user-images.githubusercontent.com/38054153/94626737-49f8a200-0281-11eb-9a64-2942b405d787.jpg)
![user-add-weigh-in](https://user-images.githubusercontent.com/38054153/94626729-4533ee00-0281-11eb-8028-bffff50bd8ba.jpg)
![user-diet](https://user-images.githubusercontent.com/38054153/94626732-45cc8480-0281-11eb-9156-ab220314f7ed.jpg)

### Admin
* Manage / add users

* Create/edit/track personalized programs for each user

![admin-program-edit-detail](https://user-images.githubusercontent.com/38054153/94626705-3b11ef80-0281-11eb-8715-50c9d2e4c8ab.jpg)
![admin-add-program](https://user-images.githubusercontent.com/38054153/94626694-3816ff00-0281-11eb-8045-19c4f048cb8b.jpg)
![programs](https://user-images.githubusercontent.com/38054153/94626722-41a06700-0281-11eb-805a-0ff3e6be48c6.jpg)
![admin-program-quick-save](https://user-images.githubusercontent.com/38054153/94626706-3c431c80-0281-11eb-9e70-0ade67999f05.jpg)
![admin-user-program](https://user-images.githubusercontent.com/38054153/94626711-3d744980-0281-11eb-9dca-18869b234f2b.png)

* Manage exercises for use in user programs

![exercises](https://user-images.githubusercontent.com/38054153/94626715-3f3e0d00-0281-11eb-8b2e-1ed196358edb.jpg)

* Track users weight and diet

![admin-user-diet](https://user-images.githubusercontent.com/38054153/94626709-3d744980-0281-11eb-8190-b49baec86c09.jpg)

* Chat with users

![quick-chat](https://user-images.githubusercontent.com/38054153/94626725-42d19400-0281-11eb-957f-bfd8e845b12e.jpg)


## Built With

* reactJS - Frontend framework
* Firebase - Backend database and authentication
* "moment" - Date management
* "bootstrap" / "react-bootstrap" - Styling components
* "chart.js" / "react-chartjs-2" - The weight tracking chart
* "formik" / "yup" - Form validation
* "lodash" - Window resize throttling
* "react-dom" / "react-router-dom" - Routing
* "recompose" - Higher order component composition
* "uuid" - Randomized ids 
