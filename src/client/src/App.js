import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import Landing from './views/Landing';
import Home from './views/Home';

// Home route for the '/' route is commented out until authentication is implemented.

function App() {
  return (
    <div>
      <Router>
        <NavBar />
        <Switch>
          <Route exact path="/">
            <Landing />
            {/* <Home /> */}
          </Route>
        </Switch>
        <Route path="/home" component={Home} />
      </Router>
    </div>
  );
}

export default App;
