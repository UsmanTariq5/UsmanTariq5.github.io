document.addEventListener('DOMContentLoaded', () => {
    const savedCity = localStorage.getItem('selectedCity') || 'Islamabad';
    fetchFiveDayForecast();

    // Set up the event listener for the filter dropdown
    const filterSelect = document.getElementById('filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const filterValue = this.value;
            const forecastData = JSON.parse(localStorage.getItem('forecastData'));
            if (forecastData) {
                displayFiveDayForecast(forecastData, filterValue);
            }
        });
    }

    // Set up the event listener for the chatbot form
    const apiPromptForm = document.getElementById('apiPromptForm');
    if (apiPromptForm) {
        apiPromptForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const apiPrompt = document.getElementById('apiPrompt').value;

            // Use your Gemini API key
            const GEMINI_API_KEY = 'AIzaSyASLwfBaYNUj05qf3aRMMZdY19Kc85nos4';

            fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: apiPrompt
                                }
                            ]
                        }
                    ]
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data);
                if (data && data.candidates && data.candidates.length > 0) {
                    let chatbotText = data.candidates[0]?.content?.parts[0]?.text || 'No content received';
                    document.getElementById('response').innerText = chatbotText;
                } else {
                    document.getElementById('response').innerText = 'No content received';
                }
            })
            .catch(error => {
                document.getElementById('response').innerText = 'Error: ' + error.message;
            });
        });
    } else {
        console.error('API Prompt Form not found!');
    }
});

async function fetchFiveDayForecast() {
    let city = localStorage.getItem('selectedCity') || 'Islamabad';
    const apiKey = 'c67edbf30f42d662c593571b2addd04e';
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
    console.log('Fetching forecast data for city:', city);
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Forecast data:', data);
        if (data.cod === "200") {
            const forecastData = data.list.filter(entry => entry.dt_txt.includes("12:00:00"));
            localStorage.setItem('forecastData', JSON.stringify(forecastData));
            displayFiveDayForecast(forecastData, 'none');
        } else {
            alert('Unable to fetch 5-day forecast data. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching 5-day forecast data:', error);
    }
}

function displayFiveDayForecast(forecastData, filter) {
    const forecastTable = document.getElementById('forecast-data');
    forecastTable.innerHTML = '';

    let filteredData = [...forecastData];

    switch (filter) {
        case 'highest-temp':
            filteredData.sort((a, b) => b.main.temp - a.main.temp);
            filteredData = [filteredData[0]]; // Only show the highest temperature day
            break;
        case 'ascending':
            filteredData.sort((a, b) => a.main.temp - b.main.temp);
            break;
        case 'descending':
            filteredData.sort((a, b) => b.main.temp - a.main.temp);
            break;
        case 'rainy':
            filteredData = filteredData.filter(entry => entry.weather[0].main.toLowerCase().includes('rain'));
            break;
        // 'none' and default case: no filtering needed
    }

    filteredData.forEach(entry => {
        const date = new Date(entry.dt_txt).toLocaleDateString();
        const temp = entry.main.temp;
        const humidity = entry.main.humidity;
        const condition = entry.weather[0].main;
        const row = `
            <tr>
                <td>${date}</td>
                <td>${temp}°C</td>
                <td>${humidity}%</td>
                <td>${condition}</td>
            </tr>
        `;
        forecastTable.innerHTML += row;
    });
}