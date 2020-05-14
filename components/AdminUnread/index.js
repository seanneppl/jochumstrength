import React, { useState, useEffect, useRef } from 'react';

import moment from 'moment';

import './style.css';
// import useClickOutside from '../../hooks/useClickOutside';


import { Link } from 'react-router-dom';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';
import ListGroup from 'react-bootstrap/ListGroup';


const AdminUnreadMessagesBase = ({ firebase }) => {
   // const [hovered, setHovered] = useState(false);
   // const [clicked, setClicked] = useState(false);
   const [unread, setUnread] = useState([]);
   const [show, setShow] = useState(false);

   const menuRef = useRef(null);
   const containerRef = useRef(null);

   // const onClickOutside = () => {
   //    setShow(false);
   //    console.log("clicked outside")
   // }

   // useClickOutside(menuRef, onClickOutside);

   const onRemoveMessage = mid => {
      return firebase.adminUnreadMessage(mid).remove();
   };

   const handleClick = (event) => {
      setShow(!show);
      // setTarget(event.target);
   };

   const clearUnread = () => {
      firebase.adminUnreadMessages().remove();
   }

   useEffect(() => {
      firebase.adminUnreadMessages().limitToLast(5).on('value', snapshot => {
         const unreadObject = snapshot.val();
         if (unreadObject) {
            const unreadList = Object.keys(unreadObject).reverse().map(key => ({
               ...unreadObject[key],
               mid: key,
            }));

            // console.log("unreadList", unreadList);
            setUnread(unreadList);
         } else {
            setUnread([])
            // console.log("no unread messages");
         }
      });

      return () => {
         firebase.users().off();
         firebase.adminUnreadMessages().off();
      };
   }, [firebase]);

   return (
      <div ref={containerRef} className="my-auto mx-auto">
         <Overlay
            container={containerRef.current}
            show={show}
            target={containerRef.current}
            className="admin-unread"
            // trigger="click"
            // key={"bottom"}
            placement={"bottom"}
         >
            <UpdatingPopover>
               <ListGroup className="admin-unread-list" ref={menuRef}>
                  {
                     unread.length > 0 ? (
                        <>
                           {
                              unread.map((message, idx) => <MessagePopover key={idx} messageId={message.mid} message={message} onRemoveMessage={onRemoveMessage} />)
                           }
                           <ListGroup.Item className="py-2 px-2">
                              <Button onClick={clearUnread} block variant="outline-danger" style={{ borderRadius: "500px" }}>Clear Messages</Button>
                           </ListGroup.Item>
                        </>
                     ) : (
                           <ListGroup.Item>
                              <div className="toast-header">
                                 <strong className="mr-auto">Unread</strong>

                              </div>
                              <div className="toast-body">
                                 No unread messages.
                              </div>
                           </ListGroup.Item>
                        )
                  }
               </ListGroup>
            </UpdatingPopover>
         </Overlay>

         <button className="d-none d-md-block admin-unread-btn" onClick={handleClick}>
            <svg className="admin-unread-icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 4.99L4 6h16zm0 12H4V8l8 5 8-5v10z" /></svg>
            <Badge>{unread.length}</Badge>
            <span className="sr-only">unread messages</span>
         </button>
      </div>
   )
}

const MessagePopover = ({ message, onRemoveMessage, messageId }) => {

   const handleClose = () => {
      onRemoveMessage(messageId)
         .catch(error => console.log("error"));
   };


   const timeFromNow = moment(message.createdAt).fromNow();

   const text = message.text.length > 100 ? `${message.text.substring(0, 100)}...` : message.text;

   return (
      // <Toast onClose={handleClose} show={true} delay={3000} autohide>
      <ListGroup.Item >
         <div className="toast-header">
            <strong className="mr-auto"><Link
               className="btn btn-link px-0 py-0"
               to={{
                  pathname: `${ROUTES.ADMIN}/${message.userId}`,
               }}
            >
               {message.username}
            </Link></strong>
            <small>{timeFromNow}</small>
            <button type="button" className="close ml-2 mb-1" data-dismiss="toast">
               <span aria-hidden="true" onClick={handleClose}>×</span><span className="sr-only">Close</span>
            </button>
         </div>
         <div className="toast-body">
            {text}
         </div>
      </ListGroup.Item>
   );
}

const UpdatingPopover = React.forwardRef(
   ({ popper, children, show: _, ...props }, ref) => {
      useEffect(() => {
         // console.log('updating!');
         popper.scheduleUpdate();
      }, [children, popper]);

      return (
         <Popover bsPrefix="popover admin-unread-popover d-none d-md-flex" ref={ref} content {...props}>
            {children}
         </Popover>
      );
   },
);

const AdminUnreadMessages = withFirebase(AdminUnreadMessagesBase);

export default AdminUnreadMessages;