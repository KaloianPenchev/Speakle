class Gesturer {
    constructor(modelConfig) {
        this.modelConfig = modelConfig;
        console.log("Model instance created (stub implementation)");
    }

    static async create(modelPath) {
        console.log(`Creating model from path: ${modelPath} (stub implementation)`);
        return new Gesturer({ modelPath });
    }

    async predict(inputValues) {
        console.log("Making prediction with stub model");
        
        return {
            gesture: 0,
            confidence: 1.0
        };
    }
}

module.exports = Gesturer;