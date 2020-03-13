import React, { useState } from 'react';
import { Link, withRouter } from 'react-router-dom';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import { PROGRAM } from '../../constants/defaultProgram';
import { SignInLink } from '../SignIn';

import { Formik } from 'formik';
import * as yup from 'yup';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';

const SignUpPage = () => (
   <>
      <Container >
         <Row>
            <Col className="d-flex justify-content-center align-items-center">
               <Card style={{ width: "30rem" }}>
                  <Card.Header className="text-center">
                     <h1>Sign Up</h1>
                     <SignInLink />
                  </Card.Header>
                  <Card.Body>
                     <SignUpForm />
                  </Card.Body>
               </Card>
            </Col>
         </Row>
      </Container>
   </>
);

const schema = yup.object({
   username: yup.string().required("Required"),
   email: yup.string().email().required("Required"),
   passwordOne: yup.string()
      .min(7, 'Must be at least 7 characters!')
      .max(24, 'Too Long!')
      .required('Required'),
   passwordTwo: yup.string()
      .oneOf([yup.ref('passwordOne'), null], 'Passwords must match')
      .required("Required")
});

const ERROR_CODE_ACCOUNT_EXISTS = 'auth/email-already-in-use';

const ERROR_MSG_ACCOUNT_EXISTS = `
  An account with this E-Mail address already exists.
  Try to login with this account instead.
`;

const SignUpFormBase = ({firebase, history}) => {
   const [error, setError] = useState(null);

   const onSubmit = ( values, {resetForm}) => {
      const { username, email, passwordOne, isAdmin } = values;

      firebase
         .doCreateUserWithEmailAndPassword(email, passwordOne)
         .then(authUser => {
            // Create a user in your Firebase realtime database
            const timestamp = firebase.serverValue.TIMESTAMP;
            firebase.user(authUser.user.uid).set({
               username,
               email,
               ADMIN: isAdmin,
               createdAt: timestamp,
               programDate: timestamp,
            });
            return authUser.user.uid;
         })
         .then(uid => {

            const timestamp = firebase.serverValue.TIMESTAMP;
            const programData = PROGRAM(timestamp);

            firebase.workouts(uid).push(programData)
               .then((snap) => {
                  const key = snap.key;
                  firebase.workoutIds(uid).update({ [key]: { title: "Your first program!", createdAt: timestamp } });
               });
         })
         .then(() => {
            return firebase.doSendEmailVerification();
         })
         .then(() => {
            resetForm({})
            history.push(ROUTES.LANDING);
         })
         .catch(error => {
            if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
               error.message = ERROR_MSG_ACCOUNT_EXISTS;
            }
            setError(error);
         });
      };

      return (
         <>
            <Formik
               validationSchema={schema}
               onSubmit={onSubmit}
               initialValues={{
                  username: '',
                  email: '',
                  passwordOne: '',
                  passwordTwo: '',
                  isAdmin: false,
               }}
            >
               {({
                  handleSubmit,
                  handleChange,
                  handleBlur,
                  values,
                  touched,
                  isValid,
                  errors,
               }) => (
                     <Form noValidate onSubmit={handleSubmit}>
                        <Form.Group md="4" controlId="validationFormikUsername">
                           <Form.Label>Username</Form.Label>
                           <Form.Control
                              type="text"
                              name="username"
                              placeholder="Full Name"
                              value={values.username}
                              onChange={handleChange}
                              isInvalid={!!errors.username}
                           />
                           <Form.Control.Feedback type="invalid">
                              {errors.username}
                           </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group md="4" >
                           <Form.Label>Email</Form.Label>
                           <Form.Control
                              type="email"
                              name="email"
                              value={values.email}
                              onChange={handleChange}
                              isInvalid={!!errors.email}
                              placeholder="Email Address"
                           />
                           <Form.Control.Feedback type="invalid">
                              {errors.email}
                           </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group md="4" controlId="validationFormikPasswordOne">
                           <Form.Label>Password</Form.Label>
                           <Form.Control
                              type="password"
                              name="passwordOne"
                              placeholder="Password"
                              value={values.passwordOne}
                              onChange={handleChange}
                              isInvalid={!!errors.passwordOne}
                           />
                           <Form.Control.Feedback type="invalid">
                              {errors.passwordOne}
                           </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group md="4" >
                           <Form.Label>Confirm Password</Form.Label>
                           <Form.Control
                              type="password"
                              name="passwordTwo"
                              value={values.passwordTwo}
                              onChange={handleChange}
                              isInvalid={!!errors.passwordTwo}
                              placeholder="Confirm Password"
                           />
                           <Form.Control.Feedback type="invalid">
                              {errors.passwordTwo}
                           </Form.Control.Feedback>
                        </Form.Group>

                        {/* <Form.Group>
                           <Form.Check
                              name="isAdmin"
                              label=" Is Admin?"
                              onChange={handleChange}
                              value={values.isAdmin}
                              isInvalid={!!errors.isAdmin}
                              feedback={errors.isAdmin}
                           />
                        </Form.Group> */}

                        <hr></hr>

                        <Button block variant="primary" type="submit">
                           Sign Up
                     </Button>

                        {error && <Alert className="mt-3" variant="warning">{error.message}</Alert>}
                     </Form>
                  )}
            </Formik>
         </>
      );

}

const SignUpLink = () => (
   <p>
      Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
   </p>
);

const SignUpForm = withRouter(withFirebase(SignUpFormBase));

export default SignUpPage;

export { SignUpForm, SignUpLink };
