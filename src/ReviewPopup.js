// CameraPopup.js
import './ReviewPopup.css'
import { db } from './firebase';
import { doc, getDoc, arrayUnion, updateDoc, setDoc} from 'firebase/firestore';
import { useEffect, useState} from 'react';

const ReviewPopup = ({ song, closePopup }) => {

  const [recentRatings, setRecentRatings] = useState({});
  const [user, setUser] = useState('');
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState(false)

  useEffect(() => {
    if (song?.id) {
      fetchRecentRatings(song.id);
    }
  }, [song.id]);

  const fetchRecentRatings = async (songId) => {
    try {
      const songRef = doc(db, 'songs', songId);
      const docSnap = await getDoc(songRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setRecentRatings(prevRatings => ({
          ...prevRatings,
          [songId]: data.ratings || []
        }));
      } else {
        setRecentRatings(prevRatings => ({
          ...prevRatings,
          [songId]: []
        }));
      }
    } catch (error) {
      console.error('Error retrieving recent ratings:', error);
      setRecentRatings(prevRatings => ({
        ...prevRatings,
        [songId]: []
      }));
    }
  };

  const handleSubmit = async () => {
    if (!user || !rating || !comment) {
      alert('Please fill out all fields before submitting.');
      return;
    }

    try {
      const songRef = doc(db, 'songs', song.id);
      const docSnap = await getDoc(songRef);

      if (docSnap.exists()) {
        const existingRatings = docSnap.data().ratings || [];

        // Add the new review to the existing ratings array
        await updateDoc(songRef, {
          ratings: arrayUnion({
            user,
            rating: parseInt(rating, 10), // Convert rating to integer
            comment
          })
        });

        // Update local state to show the new review immediately
        setRecentRatings(prevRatings => ({
          ...prevRatings,
          [song.id]: [
            ...prevRatings[song.id],
            { user, rating: parseInt(rating, 10), comment }
          ]
        }));

        // Calculate the total of the existing ratings
        const totalRating = existingRatings.reduce((sum, review) => sum + parseInt(review.rating, 10), 0) + parseInt(rating, 10);
        // Calculate the new average rating
        const newAverageRating = totalRating / (existingRatings.length + 1);

        // Update the average rating in the database
        await updateDoc(songRef, {
          averageRating: newAverageRating
        });

        // Clear the form fields after submission
        setUser('');
        setRating('');
        setComment('');
      } else {
        // If the song does not exist, create a new document for it
        const newSongData = {
          averageRating : rating,
          ratings: [
            {
              user: user,
              rating: rating,
              comment: comment,
            },
          ],
        };
  
        await setDoc(songRef, newSongData);
        setReviewStatus(true)

        // Update local state to show the new review immediately
        setRecentRatings(prevRatings => ({
          ...prevRatings,
          [song.id]: [
            ...prevRatings[song.id],
            { user, rating: parseInt(rating, 10), comment }
          ]
        }));
      }
    } catch (error) {
      console.error('Error submitting the review:', error);
    }
  };

  const handleUserName= (e) => {
    const input = e.target.value;
    const words = input.length;

    // Limit the number of words to 1-
    if (words <= 10) {
      setUser(input);
    }
  };

  const handleRating= (e) => {
    const input = e.target.value;

    if (0 <= input <= 5) {
      setRating(input);
    }
    else {
      setRating(null);
    }
  };

  const handleComment= (e) => {
    const input = e.target.value;
    const words = input.length;

    // Limit the number of words to 50
    if (words <= 50) {
      setComment(input);
    }
  };

  return (
    <div className="review-popup">
      <h1>Review</h1>

      <div class="review-main-section">
        <button class="exit_button" onClick={closePopup}>X</button>

        <div key={song.id} class="song">
          <h3>{song.name}</h3>
          <p>{song.artists[0].name}</p>
          <img src={song.album.images[0].url} alt="Album cover" width="200"/>
        </div>
        
        {!reviewStatus ? (
          <div class="user-review">
            <div class="name">
              <p>Reviewer Name</p>
              <input
              type="text"
              placeholder="User.."
              onChange={handleUserName}/>
            </div>

            <div class="rating">
              <p>Rating (1 - 5)</p>
              <input
              type="range"
              min="1"
              max="5"
              value= {rating}
              onChange={handleRating}/>
            </div>

            <div class="comments-section">
              <label for="comments">Comments:</label>
              <textarea id="comments" name="comments" onChange={handleComment}></textarea>
            </div>

            <button onClick={handleSubmit}>Send</button>
          </div>
        ) : (
          <div class="user-review">
            <p className="no_review">Thank you for your review!</p>
          </div>
        )}

        <div class="recent_reviews">
          <h3>Recent Reviews</h3>

          <div className="all_reviews">
            {recentRatings[song.id] && recentRatings[song.id].length > 0 ? (
              recentRatings[song.id].slice(-3).map((review, index) => (
                <div className="single_review" key={index}>
                  <div>
                    <p>Reviewer: {review.user}</p>
                    <p>Rating: {review.rating}</p>
                  </div>
                  <p className="comment">Comments: {review.comment}</p>
                </div>
              ))
            ) : (
              <p className="no_review">No recent reviews available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPopup;
