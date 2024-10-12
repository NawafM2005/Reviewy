import './App.css';
import { useState, useRef, useEffect } from 'react';
import Review from './Review';


function App() {
  const [inputSong, setInputSong] = useState(''); // State for the input value
  const [searchSong, setSearchSong] = useState(''); // State for the submitted search term
  const [searched, setSearched] = useState(false);
  const reviewRef = useRef(null);

  const handleSearch = () => {
    setSearchSong(inputSong); // Set the search term to the input value
    setSearched(true);
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    const words = input.length;

    // Limit the number of words to 10
    if (words <= 20) {
      setInputSong(input);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(); // Call handleSearch when Enter is pressed
    }
  };

  useEffect(() => {
    if (searched && reviewRef.current) {
      // Set a delay before scrolling
      const timer = setTimeout(() => {
        reviewRef.current.scrollIntoView({ behavior: 'smooth' });
        setSearched(false);
      }, 800);
  
      // Clean up the timer if the component unmounts or `searched` changes
      return () => clearTimeout(timer);
    }
  }, [searched]);

  return (
    <div className="App">
      <main>
        <div className="logo">
          <img src="./logo-transparent.png" alt="Logo" />
        </div>

        <p>Search Songs to Review</p>

        <div className="search_bar">
          <input
            type="text"
            placeholder="Search.."
            value={inputSong}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
          />
          <a onClick={handleSearch}>
            <img src={"./enter.png"} alt="Enter" />
          </a>
        </div>

        <h5>
          Discover and share your thoughts on your favorite songs! <br />
          Use the search bar to find a track, leave your review, and rate it.
          Whether you love exploring new music or revisiting classics, let your
          voice be heard and help others find their next favorite tune.
        </h5>
      </main>

      {searchSong && (
        <div ref={reviewRef}>
          <Review searchSong={searchSong}/>
        </div>
      )}
    </div>
  );
}

export default App;
