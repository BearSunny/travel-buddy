import './App.css';
import Map from './components/map';

function App() {
  return (
    <div className="App">
      <h1>My Travel App</h1>
      <div style={{ height: '400px', margin: '20px' }}>
        <Map />
      </div>
    </div>
  );
}

export default App;