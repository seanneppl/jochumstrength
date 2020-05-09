import React, { useEffect, useState } from 'react';
import { compose } from 'recompose';
import { Switch, Route } from 'react-router-dom';

import * as ROUTES from '../../constants/routes';

import AdminPanel from '../AdminPanel'

import { withAuthorization, withEmailVerification } from '../Session';
import { withFirebase } from '../Firebase';


// Test adding a new user
const AdminPage = ({ firebase }) => {
   const usersInit = JSON.parse(localStorage.getItem('users')) || [];
   const [usersList, setUsersList] = useState(usersInit);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      console.log("admin page mount");
      setLoading(true);
      firebase.users().on('value', snapshot => {
         const usersObject = snapshot.val();
         if (usersObject) {
            const usersList = Object.keys(usersObject).map(key => ({
               ...usersObject[key],
               uid: key,
            }));

            localStorage.setItem('users', JSON.stringify(usersList));
            setUsersList(usersList);
            setLoading(false);
         } else {
            localStorage.removeItem('users');
            setLoading(false);
         }
      });
      return () => firebase.users().off();
   }, [firebase]);

   return (
      <>
         <Switch>
            <Route path={ROUTES.ADMIN_DETAILS} children={<AdminPanel usersList={usersList} loading={loading} />} />
            <Route exact path={ROUTES.ADMIN} children={<AdminPanel usersList={usersList} loading={loading} />} />
         </Switch>
      </>
   )
};

const condition = authUser => authUser && authUser.ADMIN;

export default compose(
   withEmailVerification,
   withFirebase,
   withAuthorization(condition),
)(AdminPage);
