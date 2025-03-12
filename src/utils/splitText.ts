export const splitTextIntoLines = (selector: string) => {
  const elements = document.querySelectorAll(selector);

  elements.forEach((element) => {
    const words = element.textContent?.split(' ') || []; // Split words
    element.innerHTML = ''; // Clear original text

    let line = document.createElement('div');
    line.classList.add('text-line'); // Add class for styling

    words.forEach((word, index) => {
      const wordSpan = document.createElement('span');
      wordSpan.textContent = word + ' '; // Add space after each word
      line.appendChild(wordSpan);

      // Break into new line if needed (custom logic)
      if (index % 5 === 0 && index !== 0) {
        // Every 5 words
        element.appendChild(line);
        line = document.createElement('div');
        line.classList.add('text-line');
      }
    });

    element.appendChild(line); // Append the last line
  });
};
