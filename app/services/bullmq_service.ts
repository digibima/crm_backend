import Redis from "ioredis";
import { Queue, Worker, JobsOptions } from "bullmq";
import env from "#start/env";

class BullMqService {
    private redis: Redis;
    private queues: Map<string, Queue> = new Map();

    constructor() {
        this.redis = new Redis({
            host: env.get("REDIS_HOST"),
            port: env.get("REDIS_PORT"),
            password: env.get("REDIS_PASSWORD"),
            maxRetriesPerRequest: null, // BullMQ ke liye recommended
        });
    }

    private getQueue(queueName: string): Queue {
        if (!this.queues.has(queueName)) {
            this.queues.set(
                queueName,
                new Queue(queueName, {
                    connection: this.redis,
                })
            );
        }

        return this.queues.get(queueName)!;
    }

    async createJob(
        queueName: string,
        jobName: string,
        data: any,
        options?: JobsOptions
    ) {
        const queue = this.getQueue(queueName);
        console.log(`New job created by ${data.userId}`);
        return queue.add(jobName, data, options);
    }

    createWorker(
        queueName: string,
        processor: (job: any) => Promise<void>
    ) {
        const worker = new Worker(queueName, processor, {
            connection: this.redis,
        });

        worker.on("ready", () => {
            console.log(`${queueName} worker ready`);
        });

        worker.on("active", (job) => {
            console.log("Job Active:", job.id);
        });

        worker.on("completed", (job) => {
            console.log("Job Completed:", job.id);
        });

        worker.on("failed", (job, err) => {
            console.log("Job Failed:", err);
        });

        worker.on("error", (err) => {
            console.log("Worker Error:", err);
        });

        return worker;
    }
}

export default new BullMqService();