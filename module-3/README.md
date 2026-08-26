# Module 3: React Native Monitoring Client

This module is the React Native client for the AI-Neonatal-XAI research prototype. It sends complete manual neonatal readings to the existing FastAPI backend and renders the returned Random Forest prediction, SHAP contributions, prototype alert, and monitoring history.

This is not a medical diagnostic application. It does not integrate physical sensors, MongoDB, Firebase, or clinical workflows.

## Current Features

- Manual form for all 21 model input features.
- Required-field and numeric validation with no invented model defaults.
- `simulated: false` for manual readings.
- Typed API client for `POST /monitoring/readings`, `GET /monitoring/{infant_id}`, `GET /xai/global`, and `POST /xai/what-if`.
- Prediction and probability display.
- SHAP top-contribution display.
- Global SHAP importance screen.
- Temperature what-if analysis on the result screen.
- Prototype alert and non-diagnostic research warning.
- Monitoring-history view.
- Backend/network error handling.

The software simulator remains in `../xai-module/monitoring/simulator.py` and sends `simulated: true` readings to the same endpoint. The React Native app does not duplicate simulator or model logic.

## Backend URL

The default URL is configured in `src/config/environment.ts`:

- Android emulator: `http://10.0.2.2:8000`
- iOS simulator: `http://127.0.0.1:8000`

Use a host LAN address for a physical development device. The FastAPI server must be running separately.

## Run and Test

```powershell
npm install
npm start
```

In another terminal, run the native target:

```powershell
npm run android
# or
npm run ios
```

Run checks:

```powershell
npm test -- --runInBand
npm run lint
npx tsc --noEmit
```

The current environment validated Jest, ESLint, and TypeScript. Native Android/iOS builds require the platform toolchains and were not run here.

## API Flow

```text
Manual form
	-> typed fetch client
	-> POST /monitoring/readings
	-> FastAPI validation
	-> existing Random Forest
	-> existing SHAP service
	-> prediction + explanation result
```

Global importance uses `GET /xai/global`. What-if analysis uses `POST /xai/what-if` with the complete reading and a numeric feature change.

The training dataset is for model development/evaluation. New manual or simulated readings are application inputs and are not the training dataset or a live patient database.

## Safety Boundary

Thresholds and alerts are demonstration rules, not medically validated thresholds. SHAP values describe model associations, not causes or clinical advice. Clinical validation, authentication, secure persistence, physical sensors, and production deployment remain future scope.

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
