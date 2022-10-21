# whatsapp-rest-api

Simple REST API to send messages through POST requests.

## Installation

Inside the project folder, run:

```
yarn
```

and then run:


```
yarn start
```

By default the server will start listening to the port 6000.

# Usage

When you start the server the first time, a QR code will be printed in the console. Read the QR code with you WhatsApp app to authenticate.

After authenticating, you can send a POST request to `/sendMessage` with a JSON in the body, with the following properties:

- number: A string with the target phone number;
- message: A string with the message to be sent.

Example:

```
{
  number: "12345678",
  message: "Hello world!"
}
```
