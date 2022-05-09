import React from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";

import "firebase/firestore";

const firebase = require("firebase");
require("firebase/firestore");

//firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAr8JkAYZtyE8cNHS_t9F3Ont9bVxCEZ_o",
  authDomain: "chat-web-app-5f1cc.firebaseapp.com",
  projectId: "chat-web-app-5f1cc",
  storageBucket: "chat-web-app-5f1cc.appspot.com",
  messagingSenderId: "830888082339",
  appId: "1:830888082339:web:cd30fc45015403882c3816",
};

export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: "",
        name: "",
        avatar: "",
      },
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    //create a reference to the firestore messages collection
    this.referenceChatMessages = firebase.firestore().collection("messages");
    this.refMsgsUser = null;
  }

  componentDidMount() {
    //set name to name selected on start page
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });

    //listen to authentication events, sign in anonymously
    this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        firebase.auth().signInAnonymously();
      }
      //update user state with currently active user data
      this.setState({
        uid: user.uid,
        messages: [],
        user: {
          _id: user.uid,
          name: name,
          avatar: "https://placeimg.com/140/140/any",
        },
      });
      // listens for updates in the collection
      this.unsubscribe = this.referenceChatMessages
        .orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate);
    });
    this.refMsgsUser = firebase
      .firestore()
      .collection("messages")
      .where("uid", "==", this.state.uid);
  }
  // add a new message to the collection
  addMessage() {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      _id: message._id,
      text: message.text || "",
      createdAt: message.createdAt,
      user: this.state.user,
    });
  }

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    //go through each document
    querySnapshot.forEach((doc) => {
      //get the QueryDocumentSnapshots data
      var data = doc.data;
      messages.push({
        _id: data.id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data._id,
          name: data.user.name,
          avatar: data.user.avatar,
        },
      });
    });
    this.setState({
      messages: messages,
    });
  };

  // adds background colors for the chat text to the different chat users
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#180A0A",
          },
        }}
      />
    );
  }

  render() {
    // This will allow the user to enter it's name for the Chat app
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });

    const { bgColor } = this.props.route.params;

    return (
      <View
        style={{
          flex: 1,

          backgroundColor: bgColor,
        }}
      >
        <Text>Welcome to Happy Chat!</Text>
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: 1,
          }}
        />
        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}
