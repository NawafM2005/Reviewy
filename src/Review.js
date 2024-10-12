import { useEffect, useState } from 'react';
import './Review.css'
import axios from 'axios';
import ReviewPopup from './ReviewPopup';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

function Review({ searchSong }) {

  const CLIENT_ID = '4522a16b40b7426680730a2d71956308';
  const CLIENT_SECRET = 'b36b500772a14d6bb5f5472d2c6a463d';
  const [songs, setSongs] = useState([]);
  const [clicked, setClicked] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [ratings, setRatings] = useState({});


  const getAccessToken = async () => {
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        new URLSearchParams({
          grant_type: 'client_credentials'
        }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
        }
      });
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting access token', error);
      return null;
    }
  };

  const searchSongs = async () => {
    const token = await getAccessToken();
    if (token) {
      try {
        const response = await axios.get(`https://api.spotify.com/v1/search`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          params: {
            q: searchSong,
            type: 'track',
            limit: 20,
          }
        });
        // Filter out duplicate songs
        const uniqueSongs = response.data.tracks.items.filter((song, index, self) =>
          index === self.findIndex((s) => (
            s.name === song.name && s.artists[0].name === song.artists[0].name
          ))
        );

        setSongs(uniqueSongs);
      } catch (error) {
        console.error('Error searching for songs', error);
      }
    }
  };

  const handleClickSong = (song) => {
    setSelectedSong(song);
    setClicked(!clicked);
  };

  useEffect(() => {
    if (searchSong) {
      searchSongs();
    }
  }, [searchSong]);

  const closePopup = () => {
    setClicked(false);
    setSelectedSong(null);
  };

  useEffect(() => {
    if (songs.length > 0) {
      songs.forEach((song) => {
        fetchAverageRating(song.id);
      });
    }
  }, [songs]);

  const fetchAverageRating = async (songId) => {
    try {
      const songRef = doc(db, 'songs', songId);
      const docSnap = await getDoc(songRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setRatings(prevRatings => ({
          ...prevRatings,
          [songId]: data.averageRating || 'N/A'
        }));
      } else {
        setRatings(prevRatings => ({
          ...prevRatings,
          [songId]: 'N/A'
        }));
      }
    } catch (error) {
      console.error('Error retrieving average rating:', error);
      setRatings(prevRatings => ({
        ...prevRatings,
        [songId]: 'N/A'
      }));
    }
  };

  return (
    <section className='Section'>
      <h1>Song: {searchSong}</h1>
      <div class="all_songs">
        {songs.map((song) => (
          <div key={song.id} class="song" onClick={() => handleClickSong(song)}>
            <h3>{song.name}</h3>
            <p>{song.artists[0].name}</p>
            <img src={song.album.images[0].url} alt="Album cover" width="200"/>
            <h2>Average Rating: {ratings[song.id] || 'Loading...'}</h2>
          </div>
        ))}
      </div>
      {clicked && selectedSong && (
        <ReviewPopup song={selectedSong} closePopup={closePopup}/>
      )}    
    </section>
  );
}

export default Review;