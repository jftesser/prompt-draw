# Fashion Frenzy, a GenAI game

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn deploy`

Builds the app and deploys it to firebase hosting and functions.\

## Firebase setup

Create a new Firebase project and configure hosting, authentication, storage and functions

- Go to https://console.firebase.google.com/ and create a new project
- Go to build -> authentication -> sign-in method and choose Email/Password, create a user and password
- Go to build -> storage and enable storage
    - setup the ability for your functions to write to storage using the instructions [here](https://stackoverflow.com/questions/53143965/uploading-files-from-firebase-cloud-functions-to-cloud-storage).
    - setup cors via `gsutils` 
    

Setup firebase configuration in your local repo

- In Firebase, go to Project Overview -> click the project name -> click the settings icon to go to project settings. 
- In Project Settings, copy (or create and copy) the configuration data in the curly braces (including the curly braces). 
- In `src/firebase`, create a file called `creds.ts` and paste the configuration data into the file. 
- Open a new terminal from the root directory of your repo in VSCode, type `firebase login` to log in from the terminal 
- In terminal, type `firebase init` and select the id of the project you just made
    -  Choose to set up hosting, functions already exist in the repo (but you will be using them), do not set up github actions

Sign up for OpenAI and create an API key

Sign up for Stability and create an API key

Create a .env file inside the `functions` folder and add the following:

```
OPENAI_KEY="YOUR KEY" 
OPENAI_ORG="YOUR ORG"                        
STABILITY_API_KEY="YOUR KEY"
```

Get your admin credentials for cors access [here](https://stackoverflow.com/questions/53143965/uploading-files-from-firebase-cloud-functions-to-cloud-storage) and place them in `functions/admin-credentials.json`