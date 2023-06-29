async function query(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/microsoft/DialoGPT-small",
		{
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}

query({"inputs": {
		"past_user_inputs": ["Which movie is the best ?"],
		"generated_responses": ["It's Die Hard for sure."],
		"text": "Can you explain why ?"
	}}).then((response) => {
	console.log(JSON.stringify(response));
});