const aiRecomendationPormpt = (userProfile, ranked) => {
    return `
You are a recommendation engine.

User preferences:
${JSON.stringify(userProfile)}

Places:
${JSON.stringify(ranked.map(r => ({
        id: r.place._id,
        category: r.place.category,
        city: r.place.location.city,
        price: r.place.price
})))}

Task:
Return top 10 place IDs ranked best for the user.
Only return JSON array.
`;
};

export default aiRecomendationPormpt;