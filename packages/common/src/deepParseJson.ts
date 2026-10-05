type JsonValue = string | number | boolean | null;
type JsonObjectValue = JsonValue | JsonArray | JsonObject;
type JsonObject = { [key: string]: JsonObjectValue };
type JsonArray = JsonObjectValue[];

export const deepParseJson = (obj: JsonObjectValue): JsonObjectValue => {
	if (
		typeof obj === "string" ||
		typeof obj === "number" ||
		typeof obj === "boolean"
	) {
		if (typeof obj === "string") {
			try {
				const parsed = JSON.parse(obj);
				return deepParseJson(parsed);
			} catch (_error) {
				// console.log(error);
			}
		}
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => deepParseJson(item));
	}

	if (typeof obj === "object" && obj !== null) {
		const result: JsonObject = {};
		for (const key in obj) {
			if (obj[key] !== undefined) {
				result[key] = deepParseJson(obj[key]);
			}
		}
		return result;
	}

	return obj;
};
