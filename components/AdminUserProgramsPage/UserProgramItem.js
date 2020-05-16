import React, { Component } from "react";

import moment from 'moment';

import { withFirebase } from '../Firebase';

import Modal from '../Modal';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import HoverButton from '../HoverButton';

import { withRouter } from 'react-router-dom';

import UserProgramTable from './UserProgramTable';
// import { INITIALJSON } from '../../constants/defaultProgram';

class ProgramItemBase extends Component {
   constructor(props) {
      super(props);

      this.titleRef = React.createRef();
      this.timestamp = Number(moment().format("x"));

      this.state = {
         loading: false,
         program: null,
         uid: this.props.match.params.id || null,
         pid: this.props.match.params.pid || null,
         username: null,
         tasks: [
            {
               instruction: {
                  Number: "1", Description: "Monster Walks", Link: "https://www.youtube.com", Sets: "3", Reps: "5", Rest: ":0",
                  tracking: { "week 1": "", "week 2": "", "week 3": "" }
               }, title: "Default"
            }
         ],
         showTitle: false,
         error: null,
         ...props.location.state,
      };
   }

   handleGoBack = () => {
      this.props.history.goBack();
   }

   fetchPrograms = () => {
      console.log("requestProgramsFromSpecificUser");
      this.props.firebase
         .workouts(this.state.uid)
         .child(this.state.pid)
         .on('value', snapshot => {
            const programObject = snapshot.val();
            if (programObject) {
               this.setState({
                  program: programObject,
                  title: programObject.title,
                  loading: false,
               });
            } else {
               console.log("no program object");
            }
         });

      if (!this.state.workoutids) {
         this.props.firebase
            .workoutIds(this.state.uid)
            .once('value', snapshot => {
               const workoutIdsObject = snapshot.val();
               if (workoutIdsObject) {
                  // const idsArray = Object.keys(workoutsObject);
                  this.setState({
                     workoutids: workoutIdsObject,
                  });
               } else {
                  this.setState({ workoutids: [] })
               }
            });
      }
   }

   fetchTasks() {
      const tasks = JSON.parse(localStorage.getItem('tasks'));
      if (tasks) {
         this.setState({ tasks: tasks });
      } else {
         this.props.firebase.tasks().once("value").then(snap => {
            const tasksObject = snap.val();
            if (tasksObject) {
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

   fetchUsername() {
      this.props.firebase.user(this.state.uid).child("username").once("value").then(snap => {
         const usernameObject = snap.val();
         if (usernameObject) {
            this.setState({ username: usernameObject })
         }
      })
   }

   showTitleModal = () => {
      this.setState({ showTitle: true });
   }

   hideTitleModal = () => {
      this.setState({ showTitle: false });
   }

   editTitle = (e) => {
      e.preventDefault();
      const title = this.titleRef.current.value.trim();

      this.props.firebase
         .workouts(this.state.uid)
         .child(this.state.pid)
         .update({ "title": title })
         .then(() => {
            this.props.firebase
               .workoutId(this.state.uid, this.state.pid)
               .update({ title: title })
               .then(this.hideTitleModal);
         });
   }

   onSave = (phase, phaseUpdate) => {
      const { firebase } = this.props;
      const { uid, pid } = this.state;

      console.log("updating program");

      return firebase
         .workouts(uid)
         .child(pid)
         .child("instruction")
         .child(phase)
         .set(phaseUpdate)
   }

   setActive = (wid) => () => {
      const { workoutids } = this.state;
      const workoutidsArray = Object.keys(workoutids);
      workoutidsArray.forEach(each => {
         this.props.firebase.workoutId(this.props.match.params.id, each).update({ active: false });
      })
      this.props.firebase.workoutId(this.props.match.params.id, wid).update({ active: true })
         .then(() => {
            const idsUpdate = { ...workoutids };
            idsUpdate[wid].active = true;
            this.setState({ workoutids: idsUpdate });
            this.props.firebase.user(this.props.match.params.id).update({ programDate: this.timestamp });
         });
   };

   setInactive = (wid) => () => {
      const { workoutids } = this.state;
      this.props.firebase.workoutId(this.props.match.params.id, wid).update({ active: false })
         .then(() => {
            const idsUpdate = { ...workoutids };
            idsUpdate[wid].active = false;
            this.setState({ workoutids: idsUpdate });
            this.props.firebase.user(this.props.match.params.id).update({ programDate: null });
         });
   };


   componentDidMount() {
      this.fetchPrograms();
      this.fetchTasks();
      this.fetchUsername();
   }

   componentWillUnmount() {
      this.props.firebase.program(this.state.pid).off();
      this.props.firebase.workoutIds(this.props.match.params.id).off();
      this.props.firebase.workouts(this.state.uid).off();
      this.props.firebase.workouts(this.state.uid).child(this.state.pid).off()
      // this.props.firebase.tasks().off();
   }

   render() {
      const { program, workoutids, loading, pid, uid, tasks, error, showTitle, username } = this.state;
      const title = program ? program.title : "";
      const active = workoutids ? workoutids[pid].active : false;

      return (
         <>
            <Modal handleClose={this.hideTitleModal} show={showTitle} heading={"Change Title?"} >
               <Form onSubmit={this.editTitle}>
                  <Form.Group>
                     <Form.Label>Program Title</Form.Label>
                     <Form.Control
                        type="text"
                        ref={this.titleRef}
                        defaultValue={title}
                     />
                  </Form.Group>
                  <Button type="submit">Save Title Edit</Button>
               </Form>
            </Modal>

            {loading && <div>Loading ...</div>}
            {error && <Alert>{error.message}</Alert>}

            {program && (
               <>
                  <span className="d-flex justify-content-between align-items-center mb-2">
                     <h3 className="program-title mb-0" onClick={this.showTitleModal}>{program.title}</h3>

                     {!active
                        ? <HoverButton variant={"outline-warning"} text={"Inactive"} hoveredText={"Activate"} onClick={this.setActive(pid)} />
                        : <HoverButton variant={"outline-success"} text={"Active"} hoveredText={"Deactivate"} onClick={this.setInactive(pid)} />
                     }
                  </span>
                  {username && (<Button variant="link" onClick={this.handleGoBack} className="mx-0 px-0 py-0 mb-3">{username}</Button>)}

                  <UserProgramTable onSave={this.onSave} tasks={tasks} program={program} pid={pid} uid={uid} path={this.props.match.path} />
               </>
            )}
         </>
      );
   }
}

const UserProgramItem = withRouter(withFirebase(ProgramItemBase));

export default UserProgramItem;
