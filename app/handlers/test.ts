import { BaseHandler, ResponseBuilder } from "../utils";

class TestHandler extends BaseHandler {
    async processEvent(event: any) {
        return ResponseBuilder.success({
            message: "Todo está funcionando correctamente!",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            stage: event.requestContext?.stage || 'unknown'
        }, "Test endpoint working");
    }
}

export async function handler(event: any) {
    const instance = new TestHandler();
    return await instance.handle(event);
}