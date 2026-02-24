async function fetchLeetcode() {
    const query = `
        query questionData($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
                title
                difficulty
                exampleTestcases
            }
        }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com/',
        },
        body: JSON.stringify({
            query,
            variables: { titleSlug: 'two-sum' }
        })
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}

fetchLeetcode();
