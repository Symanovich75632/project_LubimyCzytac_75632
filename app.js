// Bazowy URL bazy danych Firebase Realtime Database
const FIREBASE_URL = 'https://projectlubimyczytac75632-default-rtdb.europe-west1.firebasedatabase.app/books.json';

// Pobieranie elementów interfejsu z pliku HTML
const addBookForm = document.getElementById('addBookForm');
const booksContainer = document.getElementById('booksContainer');

const bookModal = document.getElementById('bookModal');
const closeModalBtn = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');
const modalAuthor = document.getElementById('modalAuthor');
const modalDescription = document.getElementById('modalDescription');

// dodawanie książki do bazy danych ( POST)
addBookForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Zapobieganie przeładowaniu strony po wysłaniu formularza

    // Pobieranie danych z pól formularza
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const description = document.getElementById('bookDescription').value;

    const newBook = {
        title: title,
        author: author,
        description: description
    };

    try {
        // Wysyłanie zapytania POST do Firebase (konwersja obiektu JS na format JSON)
        const response = await fetch(FIREBASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newBook)
        });

        if (response.ok) {
            addBookForm.reset(); // Czyszczenie pól formularza po udanym dodaniu
            fetchBooks();        // Odświeżenie listy książek na stronie
        } else {
            alert('Błąd podczas dodawania książki do bazy danych.');
        }
    } catch (error) {
        console.error('Błąd podczas dodawania książki:', error);
    }
});

//2. FUNKCJA POBIERANIA KSIĄŻEK ( GET)
async function fetchBooks() {
    try {
        const response = await fetch(FIREBASE_URL);
        const data = await response.json();

        booksContainer.innerHTML = ''; // Czyszczenie kontenera przed ponownym renderowaniem

        // Jeśli baza danych jest pusta, przerywamy działanie funkcji
        if (!data) {
            booksContainer.innerHTML = '<p>Brak książek w bazie danych.</p>';
            return;
        }

        // Firebase zwraca dane jako obiekt, gdzie klucze to ID, a wartości to dane książek.
        // Iterujemy po wszystkich kluczach obiektu
        Object.keys(data).forEach(id => {
            const book = data[id];

            // Tworzenie karty książki
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            
            // Wstrzykiwanie struktury z podziałem na treść i przycisk usuwania
                bookCard.innerHTML = `
                    <div class="book-card-content">
                        <h3>${book.title}</h3>
                        <p><strong>Autor:</strong> ${book.author}</p>
                    </div>
                <button class="delete-btn" data-id="${id}">Usuń</button>
                `;  

            // Kliknięcie w treść otwiera szczegóły
            bookCard.querySelector('.book-card-content').addEventListener('click', () => {

                showBookDetails(book);
            });


             // Obsługa kliknięcia w przycisk "Usuń"                    
            bookCard.querySelector('.delete-btn').addEventListener('click', async (e) => {
                e.stopPropagation(); // Zapobiega wywołaniu zdarzenia kliknięcia na karcie
            // Dodanie gotowej karty do kontenera na stronie
                const bookId = e.target.getAttribute('data-id');
                try {
                    const deleteResponse = await fetch(`https://projectlubimyczytac75632-default-rtdb.europe-west1.firebasedatabase.app/books/${bookId}.json`, {
                        method: 'DELETE'
                    });
                    if (deleteResponse.ok) {
                        fetchBooks(); // Odświeżenie listy książek po usunięciu
                    } else {
                        alert('Błąd podczas usuwania książki z bazy danych.');
                    }   
                } catch (error) {
                    console.error('Błąd podczas usuwania książki:', error);
                }   
            });
            booksContainer.appendChild(bookCard);
        });

    } catch (error) {
        console.error('Błąd podczas pobierania książek:', error);
    }
}
//3. FUNKCJA WYŚWIETLANIA SZCZEGÓŁÓW KSIĄŻKI (Okno modalne)
function showBookDetails(book) {
    modalTitle.textContent = book.title;
    modalAuthor.textContent = `Autor: ${book.author}`;
    modalDescription.textContent = book.description;

    bookModal.classList.remove('hidden'); // Pokazywanie okna modalnego poprzez usunięcie klasy
}

// Zamykanie okna modalnego po kliknięciu na przycisk "X"
closeModalBtn.addEventListener('click', () => {
    bookModal.classList.add('hidden');
});

// Zamykanie okna modalnego po kliknięciu w dowolne miejsce poza jego zawartością
window.addEventListener('click', (e) => {
    if (e.target === bookModal) {
        bookModal.classList.add('hidden');
    }
});

// Pobieranie i wyświetlanie książek natychmiast po załadowaniu strony
fetchBooks();

//4. FUNKCJA USUWANIA KSIĄŻKI (DELETE)
async function deleteBook(bookId) {
    try {
        const response = await fetch(`https://projectlubimyczytac75632-default-rtdb.europe-west1.firebasedatabase.app/books/${bookId}.json`, {
            method: 'DELETE'
        }); 
        if (response.ok) {
            fetchBooks(); // Odświeżenie listy książek po usunięciu
        } else {
            alert('Błąd podczas usuwania książki z bazy danych.');
        }   
    } catch (error) {
        console.error('Błąd podczas usuwania książki:', error);
    }
}   
