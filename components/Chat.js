import React from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";

import "firebase/firestore";

const firebase = require("firebase");
require("firebase/firestore");

export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: "",
        name: "",
      },
    };

    const firebaseConfig = {
      apiKey: "AIzaSyAr8JkAYZtyE8cNHS_t9F3Ont9bVxCEZ_o",
      authDomain: "chat-web-app-5f1cc.firebaseapp.com",
      projectId: "chat-web-app-5f1cc",
      storageBucket: "chat-web-app-5f1cc.appspot.com",
      messagingSenderId: "830888082339",
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.referenceChatMessages = firebase.firestore().collection("messages");
  }

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    //go through each doc
    querySnapshot.forEach((doc) => {
      //get query's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: "https://placeimg.com/140/140/any",
        },
      });
    });

    this.setState({
      messages: messages,
    });
  };

  addMessage() {
    const messages = this.state.messages[0];
    this.referenceChatMessages.add({
      _id: messages._id,
      text: messages.text,
      createdAt: messages.createdAt,
      user: this.state.user,
    });
  }

  //Function to dictate the functionality of sending messages
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage();
      }
    );
  }

  //Creates a preloaded message to be displayed.
  //Then it adds a system message telling the username you entered has entered the chat
  componentDidMount() {
    let name = this.props.route.params.name;

    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        await firebase.auth().signInAnonymously();
      }

      this.setState({
        uid: user.uid,
        messages: [],
        user: {
          _id: user.uid,
          name: name,
        },
      });

      this.unsubscribe = this.referenceChatMessages
        .orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate);

      this.referenceUser = firebase
        .firestore()
        .collection("messages")
        .where("uid", "==", this.state.uid);
    });
  }

  componentWillUnmount() {
    this.authUnsubscribe();
    this.unsubscribe();
  }
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
            _id: this.state.user._id,
            name: this.state.name,
          }}
        />
        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}
