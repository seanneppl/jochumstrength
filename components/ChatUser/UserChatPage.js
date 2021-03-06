import React, { useContext } from 'react';
import { compose } from 'recompose';

import ChatMessages from '../Chat';
import Container from 'react-bootstrap/Container';

import {
   AuthUserContext,
   withAuthorization,
   withEmailVerification,
} from '../Session';

const UserChatPage = () => {
   const authUser = useContext(AuthUserContext);
   const unread = authUser.unread;
   // const [safari, setSafari] = useState(false);

   // if (!authUser.ACTIVE) {
   //    return null;
   // }

   // useEffect(() => {
   //    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
   //    setSafari(isSafari);
   // }, [])

   return (
      <>
         <Container fluid>
            <div className="app-top d-flex justify-content-center">
               <div className="contain-width">
                  {/* <h3>Messages</h3> */}
                  <ChatMessages authUser={authUser} roomId={authUser.uid} unreadCount={unread} setUnread={"unread"} setPartnerUnread={"adminUnread"} />
               </div>
            </div>
         </Container>
      </>
   )
};

const condition = authUser => !!authUser && authUser.ACTIVE;

export default compose(
   withEmailVerification,
   withAuthorization(condition),
)(UserChatPage);