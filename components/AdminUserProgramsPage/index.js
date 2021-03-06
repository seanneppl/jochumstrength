import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { compose } from 'recompose';

import UserProgramItem from './UserProgramItem';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import { withAuthorization, withEmailVerification } from '../Session';
import * as ROUTES from '../../constants/routes';

const style = { width: "100%" };

const AdminUserProgramsPage = () => (
   <>
      <Container fluid>
         <div className="app-top d-flex justify-content-center">
            <div style={style}>
               <Row>
                  <Col>
                     <Switch>
                        <Route exact path={ROUTES.WORKOUT_DETAILS} component={UserProgramItem} />
                     </Switch>
                  </Col>
               </Row>
            </div>
         </div>
      </Container>
   </>
);

const condition = authUser => authUser && authUser.ADMIN;

export default compose(
   withEmailVerification,
   withAuthorization(condition),
)(AdminUserProgramsPage);
