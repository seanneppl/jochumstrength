import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";

import "./style.css";
import Form from 'react-bootstrap/Form'

class Autocomplete extends Component {
   static propTypes = {
      suggestions: PropTypes.instanceOf(Array)
   };

   static defaultProps = {
      suggestions: []
   };

   constructor(props) {
      super(props);

      // const initialUserInput = props.initialValue;

      this.state = {
         // The active selection's index
         activeSuggestion: null,
         // The suggestions that match the user's input
         filteredSuggestions: [],
         // Whether or not the suggestion list is shown
         showSuggestions: false,

         refsList: [],

         // What the user has entered
         // userInput: initialUserInput,
      };

      this.myRef = React.createRef();
      this.scrollContain = React.createRef();
   }

   handleChange = e => {
      const { suggestions } = this.props;
      // const userInput = e.currentTarget.value;

      // Filter our suggestions that don't contain the user's input
      const filteredSuggestions = suggestions.filter(
         suggestion =>
            suggestion.e.toLowerCase().indexOf(this.props.initialValue.toLowerCase()) > -1
      );

      const refsList = filteredSuggestions.reduce((acc, value, idx) => {
         acc[idx] = React.createRef();
         return acc;
      }, {});

      this.setState({
         activeSuggestion: null,
         filteredSuggestions,
         showSuggestions: true,
         refsList: refsList,
         // userInput: e.currentTarget.value
      });

      this.props.onChange(e.currentTarget.value);
   };

   onClick = (e, l) => () => {
      // console.log(e, l);
      this.setState({
         activeSuggestion: null,
         filteredSuggestions: [],
         showSuggestions: false,
      });
      this.props.onChange(e, l);
   };

   handleScroll = idx => {
      const { current } = this.state.refsList[idx]
      this.scrollContain.current.scrollTop = current.offsetTop;
   }

   blurInput = (e) => {

      this.setState({
         activeSuggestion: null,
         filteredSuggestions: [],
         showSuggestions: false,
      });
   }

   // Got it working how I wanted. Keep trying to break it!
   // Try it in a table. Have it autofill other inputs.
   onKeyDown = e => {
      // eslint-disable-next-line
      const { activeSuggestion, filteredSuggestions, userInput } = this.state;

      // User pressed the enter key
      if (e.keyCode === 13) {
         if (filteredSuggestions.length > 0 && activeSuggestion !== null) {

            // console.log(activeSuggestion);

            // console.log((filteredSuggestions[activeSuggestion].Link))

            const { e, l } = filteredSuggestions[activeSuggestion]

            this.setState({
               activeSuggestion: null,
               showSuggestions: false,
               // userInput: filteredSuggestions[activeSuggestion].Exercise
            });
            this.props.onChange(e, l);

         } else {
            this.setState({
               activeSuggestion: null,
               showSuggestions: false,
               // userInput: userInput,
            });

            this.props.onChange(this.props.initialValue);
         }
      }

      // User pressed the up arrow
      else if (e.keyCode === 38) {
         if (activeSuggestion === 0) {
            this.setState({ activeSuggestion: null });
            return;
         }
         this.setState({ activeSuggestion: activeSuggestion - 1 });
      }

      // User pressed the down arrow
      else if (e.keyCode === 40) {

         if (activeSuggestion === null) {
            this.setState({ activeSuggestion: 0 });
            return;
         }
         if (activeSuggestion + 1 === filteredSuggestions.length) {
            return;
         }

         this.setState({ activeSuggestion: activeSuggestion + 1 });
      }

      // Esc key
      else if (e.keyCode === 27) {
         this.setState({
            activeSuggestion: null,
            filteredSuggestions: [],
            showSuggestions: false,
         });
      }
   };

   shouldComponentUpdate(nextProps, nextState) {
      // header, initialValue, suggestions
      if (this.props.initialValue !== nextProps.initialValue) {
         return true;
      }
      if (this.props.header !== nextProps.header) {
         return true;
      }
      if (this.props.suggestions !== nextProps.suggestions) {
         return true;
      }
      if (this.state.showSuggestions !== nextState.showSuggestions) {
         return true;
      }
      if (this.state.activeSuggestion !== nextState.activeSuggestion) {
         return true;
      }
      if (this.state.filteredSuggestions !== nextState.filteredSuggestions) {
         return true;
      }
      return false;
   }

   render() {
      const {
         handleChange,
         onClick,
         onKeyDown,
         blurInput,
         state: {
            activeSuggestion,
            filteredSuggestions,
            showSuggestions,
            // eslint-disable-next-line
            userInput
         }
      } = this;

      // const refBoundingClient = this.myRef.current ? this.myRef.current.getBoundingClientRect() : null;
      // The 15px is for the padding from the surrounding container.
      const position = {
         // left: this.myRef.current ? Math.floor(this.myRef.current.getBoundingClientRect().x) - 15 + "px" : null,
         width: this.myRef.current ? this.myRef.current.getBoundingClientRect().width + "px" : null,
      }

      let suggestionsListComponent;
      // const filteredSlice = filteredSuggestions.slice(0, 5);

      // if (showSuggestions && userInput) {
      if (showSuggestions && this.props.initialValue) {
         if (filteredSuggestions.length) {
            suggestionsListComponent = (
               <ul ref={this.scrollContain} className="suggestions" style={position}>
                  {filteredSuggestions.map((suggestion, index) => {
                     let className;

                     // Flag the active suggestion with a class
                     if ((index) === activeSuggestion) {
                        className = "suggestion-active";
                        this.handleScroll(index);
                     }

                     return (
                        <li ref={this.state.refsList[index]} className={className} key={index} onMouseDown={onClick(suggestion.e, suggestion.l)}>
                           {suggestion.e}
                        </li>
                     );
                  })}
               </ul>
            );
         }
      }

      return (
         <Fragment>
            <Form.Control
               type="text"
               className="cell right"
               onChange={handleChange}
               onKeyDown={onKeyDown}
               name={this.props.header}
               value={this.props.initialValue}
               ref={this.myRef}
               onBlur={blurInput}
            />
            {suggestionsListComponent}
         </Fragment>
      );
   }
}


export default Autocomplete;
