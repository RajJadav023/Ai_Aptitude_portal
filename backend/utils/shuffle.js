/**
 * Fisher-Yates Shuffle Algorithm
 * Randomizes the order of elements in an array in-place.
 * @param {Array} array - The array to shuffle.
 * @returns {Array} - The shuffled array.
 */
const shuffleArray = (array) => {
    const shuffled = [...array]; // Create a copy to avoid mutating the original if desired
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

module.exports = { shuffleArray };
