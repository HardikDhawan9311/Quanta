fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    body: JSON.stringify({
        query: `
            query getQuestionDetail($titleSlug: String!) {
              question(titleSlug: $titleSlug) {
                questionId
                title
                titleSlug
                content
                difficulty
                exampleTestcases
              }
            }
        `,
        variables: { titleSlug: "two-sum" }
    })
}).then(res => res.json()).then(console.log).catch(console.error);
