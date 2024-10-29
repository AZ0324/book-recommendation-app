// src/App.js
import React, { useState } from 'react';
import './App.css';

const App = () => {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState('intitle'); // Default to search by title
    const [books, setBooks] = useState([]);
    const [error, setError] = useState('');
    const [startIndex, setStartIndex] = useState(0);
    const [maxResults] = useState(10); // Maximum number of results to fetch

    // handles input change
    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };
    // handles search type change
    const handleSearchTypeChange = (e) => {
        setSearchType(e.target.value);
    };
    //fetch books function
    const fetchBooks = async (e) => {
        if (e) e.preventDefault(); // Prevent default form submission if fetching books directly
        
        setError('');

        // Reset books and startIndex if a new search is initiated
        if (e) {
            setBooks([]); 
            setStartIndex(0); 
        }

        await loadBooks(0);
    };
    //loads more books without resetting index (load more button)
    const loadMoreBooks = async () => {
        await loadBooks(startIndex);
    };
    //gets book data from api
    const loadBooks = async (index) => {
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchType}:${query}&maxResults=${maxResults}&startIndex=${index}&key=API_KEY`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error ${response.status}: ${errorData.error.message}`);
            }
            
            const data = await response.json();
            
            if (data.items) {
                setBooks((prevBooks) => [...prevBooks, ...data.items]); // Append new results to the existing book list
                setStartIndex((prevIndex) => prevIndex + maxResults); // Update the start index for the next fetch
            } else {
                setBooks([]);
                setError('No books found.');
            }
        } catch (err) {
            setError(`An error occurred while fetching data: ${err.message}`);
            console.error(err);
        }
    };

    // creates the webpage, including the search bar and drop down 
    return (
        <div className="App">
            <h1>Book Recommendation App</h1>
            <form onSubmit={fetchBooks}>
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Enter a title, author, or genre"
                />
                <select value={searchType} onChange={handleSearchTypeChange}> 
                    <option value="intitle">Title</option>
                    <option value="inauthor">Author</option>
                    <option value="subject">Genre</option>
                </select>
                <button type="submit">Search</button>
            </form>
            {error && <p className="error">{error}</p>}
            <div className="book-list">
                {books.map((book) => (
                    <div key={book.id} className="book">
                        <h2>{book.volumeInfo.title}</h2>
                        <h3>{book.volumeInfo.authors?.join(', ')}</h3>
                        <img src={book.volumeInfo.imageLinks?.thumbnail} alt={book.volumeInfo.title} />
                        <p>{book.volumeInfo.description}</p>
                    </div>
                ))}
            </div>
            {books.length > 0 && (
                <button onClick={loadMoreBooks}>Load More</button> // Load More button
            )}
        </div>
    );
};

export default App;
