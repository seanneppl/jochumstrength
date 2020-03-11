import React, { Component } from "react";

import { withFirebase } from '../Firebase';

import BreadCrumbs from '../BreadCrumbs';
import Modal from '../Modal';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

// import { withRouter } from 'react-router-dom';

import ProgramTable from './ProgramTable';
import * as ROUTES from '../../constants/routes';
// import { INITIALJSON } from '../../constants/defaultProgram';

// import Button from 'react-bootstrap/Button';
// import Form from 'react-bootstrap/Form';

class ProgramItemBase extends Component {
   constructor(props) {
      super(props);

      const fromAdminPage = (this.props.match.path === ROUTES.CREATE_DETAILS) || (this.props.match.path === ROUTES.PROGRAM_DETAILS);

      this.state = {
         loading: false,
         program: null,
         uid: this.props.match.params.id || null,
         pid: this.props.match.params.pid || null,
         editable: false,
         admin: fromAdminPage,
         tasks: [
            {
               instruction: {
                  Number: "1", Description: "Monster Walks", Link: "https://www.youtube.com", Sets: "3", Reps: "5", Rest: ":0",
                  tracking: { "week 1": "", "week 2": "", "week 3": "" }
               }, title: "Default"
            }
         ],
         show: false,
         showTitle: false,
         title: "",
         // phaseTitle: "phase 3",
         error: null,
         ...props.location.state,
      };
   }

   // handleGoBack = () => {
   //    this.props.history.goBack();
   // }

   requestProgramsFromCreatePage = () => {
      // console.log("pid:", this.state.pid);

      console.log("requestProgramsFromCreatePage");
      this.props.firebase
         .program(this.state.pid)
         .on('value', snapshot => {
            const programObject = snapshot.val();
            if (programObject) {
               // console.log("programObject: ", programObject)

               this.setState({
                  program: programObject,
                  loading: false,
                  title: programObject.title,
                  editable: true,
               });
            } else {
               console.log("no program object");
            }
         });
   }

   requestProgramsFromSpecificUser = () => {
      console.log("requestProgramsFromSpecificUser");
      this.props.firebase
         .workouts(this.state.uid)
         .child(this.state.pid)
         .on('value', snapshot => {
            const programObject = snapshot.val();
            if (programObject) {
               // console.log(programObject)

               this.setState({
                  program: programObject,
                  title: programObject.title,
                  loading: false,
               });
            } else {
               console.log("no program object");
            }
         });
   }

   fetchTasks() {
      const tasks = JSON.parse(localStorage.getItem('tasks'));
      if (tasks) {
         this.setState({ tasks: tasks })
      } else {
         this.props.firebase.tasks().once("value").then(snap => {
            const tasksObject = snap.val();
            if (tasksObject) {
               // console.log("tasks", tasksObject);
               const tasksList = Object.keys(tasksObject);
               const tasksArray = tasksList.map(key => ({
                  tid: key,
                  ...tasksObject[key],
               }));

               this.setState({ tasks: tasksArray })
            }
         })
      }
   }

   handleChange = (e) => {
      const { name, value } = e.target;
      this.setState({ [name]: value })
   }

   // handleAddPhase = (e) => {

   //    e.preventDefault();
   //    const programUpdate = { ...this.state.program };
   //    const instructionUpdate = { ...programUpdate.instruction };

   //    instructionUpdate[this.state.phaseTitle] = {
   //       "completed": "false",
   //       "day 1": INITIALJSON,
   //       "day 2": INITIALJSON,
   //    };

   //    // Is this necessary?

   //    const instructionUpdateOrdered = {};
   //    Object.keys(instructionUpdate).sort().forEach(function (key) {
   //       instructionUpdateOrdered[key] = instructionUpdate[key];
   //    });

   //    programUpdate["instruction"] = instructionUpdateOrdered;

   //    // console.log(programUpdate);

   //    if (this.props.match.path === ROUTES.CREATE_DETAILS) {
   //       this.props.firebase
   //          .program(this.state.pid)
   //          .update({
   //             instruction: instructionUpdateOrdered,
   //          })
   //          .then(() => this.setState({ program: programUpdate }))
   //          .catch(error => this.setState({ error }))
   //       // console.log(this.state.pid, instructionUpdate);
   //       // this.setState({ program: programUpdate });
   //    }

   //    if (this.props.match.path === ROUTES.PROGRAM_DETAILS) {
   //       this.props.firebase
   //          .workouts(this.state.uid)
   //          .child(this.state.pid)
   //          .update({
   //             instruction: instructionUpdateOrdered,
   //          })
   //          .then(() => this.setState({ program: programUpdate }))
   //          .catch(error => this.setState({ error }))
   //       // console.log(this.state.pid, this.state.uid, instructionUpdate);
   //       // this.setState({ program: programUpdate });
   //    }

   //    this.hideModal();
   // }

   showModal = () => {
      this.setState({ show: true });
   }

   hideModal = () => {
      this.setState({ show: false });
   }

   showTitleModal = () => {
      this.setState({ showTitle: true });
   }

   hideTitleModal = () => {
      this.setState({ showTitle: false });
   }

   editTitle = (e) => {
      e.preventDefault();
      if (this.state.uid) {
         this.props.firebase
            .workouts(this.state.uid)
            .child(this.state.pid)
            .update({ "title": this.state.title })
            .then(this.hideTitleModal);
      } else {
         this.props.firebase
            .program(this.state.pid)
            .update({ "title": this.state.title })
            .then(this.hideTitleModal);
      }
   }

   componentDidMount() {
      this.state.uid ? this.requestProgramsFromSpecificUser() : this.requestProgramsFromCreatePage();
      this.fetchTasks();
   }

   componentWillUnmount() {
      this.props.firebase.program(this.state.pid).off();
      this.props.firebase.workouts(this.state.uid).off();
      this.props.firebase.workouts(this.state.uid).child(this.state.pid).off()
      // this.props.firebase.tasks().off();
   }

   render() {
      const { program, loading, pid, uid, tasks, error, showTitle, title } = this.state;
      // console.log(pid, uid);
      // console.log(program);

      return (
         <>
            <Modal handleClose={this.hideTitleModal} show={showTitle} heading={"Change Title?"} >
               <Form onSubmit={this.editTitle}>
                  <Form.Group>
                     <Form.Label>Program Title</Form.Label>
                     <Form.Control
                        type="text"
                        onChange={this.handleChange}
                        name="title"
                        value={title}
                     />
                  </Form.Group>
                  <Button type="submit">Save Title Edit</Button>
               </Form>
            </Modal>

            {loading && <div>Loading ...</div>}
            {error && <Alert>{error.message}</Alert>}

            {program && (
               <>
                  <BreadCrumbs />
                  {/* <BreadCrumbs history={this.props.history} /> */}
                  <span className="d-flex justify-content-between align-items-center">
                     <h3 className="color-white">{program.title}</h3>
                     <Button variant="outline-warning" onClick={this.showTitleModal}>Edit</Button>
                  </span>

                  <ProgramTable showModal={this.showTitleModal} tasks={tasks} program={program} pid={pid} uid={uid} path={this.props.match.path} />
               </>
            )}
         </>
      );
   }
}

// const ProgramItem = withRouter(withFirebase(ProgramItemBase));
const ProgramItem = withFirebase(ProgramItemBase);

export default ProgramItem;
