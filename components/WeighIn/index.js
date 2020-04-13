import React, { Component } from 'react';

import { withFirebase } from '../Firebase';

import Modal from '../Modal';
// import Loading from '../Loading';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

import PaginationBasic from '../PaginationBasic';
import { Scatter } from 'react-chartjs-2';
import moment from 'moment';

// const data = {
//    "0": { date: "3/1/2020", weight: "180" },
//    "1": { date: "3/2/2020", weight: "185" },
//    "2": { date: "3/3/2020", weight: "184" },
//    "3": { date: "3/4/2020", weight: "182" }
// }

class WeightBase extends Component {
   constructor(props) {
      super(props);

      this.dataSetOptions = {
         label: 'Weight',
         fill: false,
         lineTension: .3,
         // backgroundColor: 'rgba(765, 42, 52)',
         borderColor: 'rgba(65, 42, 52)',
         // borderCapStyle: 'butt',
         // borderJoinStyle: 'miter',
         pointBorderColor: 'rgb(65, 42, 52)',
         pointBackgroundColor: 'rgba(65, 42, 52)',
         pointBorderWidth: 1,
         pointHoverRadius: 5,
         // pointHoverBackgroundColor: 'rgba(65, 42, 52)',
         // pointHoverBorderColor: 'rgba(65, 42, 52)',
         pointHoverBorderWidth: 2,
         pointRadius: 3,
         pointHitRadius: 10,
      }

      const initialData = {
         labels: [],
         datasets: [
            {
               ...this.dataSetOptions,
               data: [],
            }
         ],

      };

      const currentDate = moment().format('YYYY-MM-DD');

      this.state = {
         tracking: [],
         loading: false,
         data: JSON.parse(localStorage.getItem('chartData')) || initialData,
         show: false,
         options: {},
         weight: "180",
         lastDate: "",
         invalid: false,
         date: currentDate,
         queryDate: currentDate,
         error: null,
      }
   }

   options = (weightData) => ({
      responsive: true,
      legend: {
         display: false,
      },
      title: {
         display: true,
         text: 'Weight'
      },
      animation: {
         animateScale: true
      },
      tooltips: {
         callbacks: {
            label: function (tooltipItem, data) {
               const label = data.labels[tooltipItem.index];
               const toDay = label.format("MMM D");
               const weight = tooltipItem.yLabel;
               return toDay + ": " + weight + "lbs";
            }
         }
      },
      scales: {
         yAxes: [{
            ticks: {
               // beginAtZero: true,
               callback: function (value) { if (Number.isInteger(value)) { return value; } },
               stepSize: 1,
               suggestedMin: Math.min(...weightData) - 5,
               suggestedMax: Math.max(...weightData) + 5,
            },
            scaleLabel: {
               display: true,
               labelString: 'lbs'
            }
         }],
         xAxes: [{
            // time settings
            type: 'time',
            time: {
               unit: 'day',
               unitStepSize: 1,
               displayFormats: {
                  day: 'MMM D'
               }
            },
            scaleLabel: {
               display: true,
               labelString: 'Date',
            },
            distribution: 'linear',
         }]
      }
   })

   onChange = (e) => {
      const { name, value } = e.target;
      this.setState({ [name]: value })
   }

   addWeightIn = (e) => {
      e.preventDefault();
      const timestamp = Number(moment(this.state.date).format("x"));
      const nowString = moment(this.state.date).format("MMM D");
      const lastDatestring = moment(this.state.lastDate).format("MMM D");

      // this check need to be redone. Maybe do a checkQuery function like in the diet page.
      if (lastDatestring === nowString) {
         this.setState({ invalid: true })
      } else {
         console.log("Checked In Added", this.state.weight)
         this.props.firebase.weighIn(this.props.authUser.uid).push({ date: timestamp, weight: this.state.weight })
            .then(this.hideModal)
            .catch(error => this.setState({ error }))
      }

      // add a changeQuery back to current date?
   }

   showModal = () => this.setState({ show: true });
   hideModal = () => this.setState({ show: false, invalid: false });

   fetchData = (date, onMount) => {
      this.setState({ loading: true });

      // const quickAdd = [
      //    { date: new Date("2/26/2020").getTime(), weight: "184" },
      //    { date: new Date("2/27/2020").getTime(), weight: "183" },
      //    { date: new Date("2/28/2020").getTime(), weight: "182" },
      //    { date: new Date("3/1/2020").getTime(), weight: "180" },
      //    { date: new Date("3/2/2020").getTime(), weight: "179" },
      //    { date: new Date("3/6/2020").getTime(), weight: "178" },
      //    { date: new Date("3/8/2020").getTime(), weight: "177" },
      //    { date: new Date("3/15/2020").getTime(), weight: "176" },
      // ]
      // quickAdd.map(key => this.props.firebase.weighIn(this.props.authUser.uid).push(key));


      // const recentDate = Number(moment(date).format("x"));
      // const previousDate = Number(moment(date).subtract(1, "w").format("x"));

      const startOf = Number(moment(date).startOf("month").format("x"));
      const endOf = Number(moment(date).endOf("month").format("x"));

      // const startOfFormatted = moment(date).startOf("month").format("YYYY-MM-DD");
      // const endOfFormatted = moment(date).endOf("month").format("YYYY-MM-DD");

      this.props.firebase
         .weighIn(this.props.authUser.uid)
         .orderByChild("date")
         .startAt(startOf)
         .endAt(endOf)
         // .limitToLast(7)
         .on("value", (snap) => {
            const weighInObject = snap.val();

            if (weighInObject) {

               const dataArray = Object.keys(weighInObject).map(key => weighInObject[key]);

               const weightData = dataArray.map(item => item.weight);
               const dateLabels = dataArray.map((item) => moment(item.date).startOf("day"));

               const weightDataFullMonth = [null, ...weightData, null];
               const dateLabelsFullMonth = [startOf, ...dateLabels, endOf];

               const chartData = {
                  labels: dateLabelsFullMonth,
                  datasets: [
                     {
                        ...this.dataSetOptions,
                        data: weightDataFullMonth
                     }
                  ],
               };
               localStorage.setItem('chartData', JSON.stringify(chartData));

               const newOptions = this.options(weightData);

               if (onMount) {
                  this.setState({ data: chartData, options: newOptions, weight: weightData[weightData.length - 1], lastDate: dateLabels[dateLabels.length - 1], loading: false });
               } else {
                  this.setState({ data: chartData, options: newOptions, loading: false });
               }
            } else {
               const weightData = [null, null];

               const chartData = {
                  labels: [startOf, endOf],
                  datasets: [
                     {
                        ...this.dataSetOptions,
                        data: weightData
                     }
                  ],
               };
               const newOptions = this.options([this.state.weight]);
               // make a reset object?
               if (onMount) {
                  this.setState({ data: chartData, options: newOptions, weight: '180', lastDate: '', loading: false });
               } else {
                  this.setState({ data: chartData, options: newOptions, loading: false });
               }
               localStorage.removeItem('chartData');
            }
         })
   }

   changeQueryDate = (date) => () => {
      this.setState({ queryDate: date });
      this.fetchData(date, false);
   }

   componentDidMount() {
      this.fetchData((this.state.queryDate), true);
   }

   render() {

      const { data, options, invalid, show, weight, error, queryDate } = this.state;
      const now = moment().format('YYYY-MM-DD');
      const nowDateUnix = Number(moment(now).format("x"));

      return (
         <>
            <Modal show={show} handleClose={this.hideModal} heading={"Add Weigh In"}>
               <Form onSubmit={this.addWeightIn}>
                  <Form.Group>
                     <Form.Label>Add Weigh In - {now}</Form.Label>
                     <Form.Control
                        type="number"
                        name="weight"
                        onChange={this.onChange}
                        value={weight}
                        required
                        isInvalid={invalid}
                        min="0"
                        max="1000"
                     />
                     <Form.Control.Feedback type="invalid">
                        Already Checked In Today.
                     </Form.Control.Feedback>
                  </Form.Group>
                  <Button disabled={invalid} type="submit">Add</Button>
               </Form>
            </Modal>

            {error && <Alert variant="warning">{error.message}</Alert>}

            <Form className="mt-3 px-5">
               <Button block variant="outline-primary" onClick={this.showModal}>Add Weigh In</Button>
            </Form>

            {/* {loading && <Loading />} */}

            <Scatter
               data={data}
               options={options}
            />

            <div className="d-flex justify-content-center">
               <div>
                  <PaginationBasic queryDate={queryDate} changeQueryDate={this.changeQueryDate} now={nowDateUnix} format={'YYYY-MM-DD'} spacing={"months"} />
               </div>
            </div>

         </>
      )
   }
}

const Weight = withFirebase(WeightBase);

export default Weight;