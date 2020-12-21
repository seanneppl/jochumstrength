import React, { Component, useState, useContext } from 'react';
import moment from 'moment';

import "./style.css";

import { AuthUserContext } from '../../Session';
import { withFirebase } from '../../Firebase';

import MessageList from './ChatMessageList';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
// import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
// import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';

// set limit? limit for initial load then show all?

class AdminChatBase extends Component {
  constructor(props) {
    super(props);
    this.scrollContain = React.createRef();
    this.inputRef = React.createRef();
    this.scrollBottom = React.createRef();
    this.state = {
      scroll: true,
      loading: false,
      messages: [],
      limit: 15,
      firstDate: null,
      lastDate: null,
    }
  }

  scrollToBottom = () => {
    // this.scrollContain.current.scrollTop = this.scrollContain.current.scrollHeight;
    // this.scrollContain.current.scrollTop = this.scrollBottom.current.offsetTop;
    // this.scrollContain.current.scrollTo(0, this.scrollBottom.current.offsetTop);
    this.scrollBottom.current.scrollIntoView();
  }

  onListenForMessages() {
    // this.setState({ loading: true });

    // Return items less than or equal to the specified key or value
    // .endAt(recentDate)
    // Return items greater than or equal to the specified key or value
    // .startAt(prevDate)
    // const now = Number(moment().format("x"));

    this.props.firebase
      .messages(this.props.roomId).off();

    this.props.firebase
      .messages(this.props.roomId)
      .orderByChild('createdAt')
      // .endAt(now)
      .limitToLast(this.state.limit)
      .on("value", snapshot => {
        const messageObject = snapshot.val();

        if (messageObject) {
          // console.log("messageObject", messageObject);

          const messageList = Object.keys(messageObject).map(key => ({
            ...messageObject[key],
            mid: key,
          }));

          // console.log(messageList);
          // this.props.firebase.user(this.props.roomId).child("unread").update({ unread: null });
          this.setState({ messages: messageList, loading: false, lastDate: messageList[0].createdAt });
        } else {
          this.setState({ messages: [], loading: false })
        }
      })
  }

  onCreateMessage = (authUser, message) => {
    const text = message.trim();
    if (text !== "") {

      const messageObject = {
        text,
        userId: authUser.uid,
        username: authUser.username,
        createdAt: Number(moment().format("x")),
      };

      this.props.firebase.messages(this.props.roomId).push(messageObject)
      // .then((snap) => {
      //    const key = snap.key;
      //    this.props.firebase.adminUnread().update({ [key]: messageObject });
      // });

      this.props.firebase.user(this.props.roomId).child("unread").push(messageObject);
      this.setState({ scroll: true });
    }
  }

  onRemoveMessage = mid => {
    this.props.firebase.message(this.props.roomId, mid).remove();
  };

  loadMore = () => {
    if (!this.state.firstDate) {
      this.props.firebase.messages(this.props.roomId)
        .orderByChild('createdAt')
        .limitToFirst(1)
        .once("value").then(snapshot => {
          const messageObject = snapshot.val();
          if (messageObject) {
            const message = Object.keys(messageObject).map(key => ({
              ...messageObject[key],
              mid: key,
            }))[0];
            // console.log('firstMessage', message);
            this.setState(state => ({ limit: state.limit + 15, firstDate: message.createdAt, scroll: false }), () => this.onListenForMessages())
          }
        })
    } else {
      this.setState(state => ({ limit: state.limit + 15, scroll: false }), () => this.onListenForMessages());
    }
  }

  // setVerticalHeight = () => {
  //    const vh = window.innerHeight * 0.01;
  //    document.documentElement.style.setProperty('--vh', `${vh}px`);
  // }

  setCurrentlyMessaging = () => {
    this.props.firebase.info().on('value', (snapshot) => {
      const infoObject = snapshot.val();
      if (infoObject === false) {
        return;
      };

      const userStatusDatabaseRef = this.props.firebase.currentlyMessaging();

      userStatusDatabaseRef
        .onDisconnect()
        .set({})
        .then(() => {
          userStatusDatabaseRef.set({ uid: this.props.roomId })
        })
    })
  }

  componentDidMount() {
    // console.log("mount");
    // this.setVerticalHeight();

    this.props.firebase.messages(this.props.roomId).off();
    this.onListenForMessages();
    this.setCurrentlyMessaging();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.scroll === true) {
      this.scrollToBottom();
    }
  }

  componentWillUnmount() {
    this.props.firebase.messages(this.props.roomId).off();
    this.props.firebase.info().off();
    this.props.firebase.currentlyMessaging().remove();
  }

  render() {
    const { messages, loading, firstDate } = this.state;

    const messageDates = messages.map(message => message.createdAt);
    const firstDateNotIncluded = messageDates.indexOf(firstDate) === -1 ? true : false;
    const enoughMessages = messages.length === this.state.limit ? true : false;

    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            <Container ref={this.scrollContain} className="messageContainer" fluid>

              {loading && <div>Loading ...</div>}

              {firstDateNotIncluded && enoughMessages && <Button variant="outline-primary" className="mt-3 messageLoadMore" block onClick={this.loadMore}>Load More</Button>}

              {(messages.length > 0) ? (
                <MessageList
                  authUser={authUser}
                  messages={messages}
                  onRemoveMessage={this.onRemoveMessage}
                />
              ) : (
                  <div>There are no messages ...</div>
                )}
              <div className="mb-3" ref={this.scrollBottom}></div>
            </Container>

            <SubmitForm onCreateMessage={this.onCreateMessage} />

          </div>
        )}
      </AuthUserContext.Consumer>
    )
  }
}

const SubmitForm = ({ onCreateMessage }) => {
  const [message, setMessage] = useState('');
  const authUser = useContext(AuthUserContext);

  const autoSize = (e) => {
    const { target } = e;
    // setTimeout(function () {
    target.style.cssText = 'height:auto; padding:6px';
    // for box-sizing other than "content-box" use:
    // el.style.cssText = '-moz-box-sizing:content-box';
    target.style.cssText = 'height:' + target.scrollHeight + 'px';
    // }, 0);
  }

  const onEnterPress = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      if (message !== "") {
        handleCreateMessage(e)
      }
    }
  }

  const onChange = (e) => {
    autoSize(e);
    setMessage(e.target.value);
  }

  const handleCreateMessage = (e) => {
    e.preventDefault();
    onCreateMessage(authUser, message);
    setMessage("");
  }

  return (
    <Form className="chat-form" onSubmit={handleCreateMessage}>
      <div className="chat-form-corner"></div>
      <textarea
        rows="1"
        style={{ height: "36px" }}
        placeholder="Reply..."
        className="chat-form-input"
        type="text"
        onChange={onChange}
        onKeyDown={onEnterPress}
        value={message}
      />
      <Button className="chat-form-submit" type="submit">Send</Button>
    </Form>
  )
}

const AdminChat = withFirebase(AdminChatBase);

export default AdminChat;