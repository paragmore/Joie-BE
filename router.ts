import { FastifyInstance } from "fastify"
import featureSampleRoutes from './src/features/featureSample/featureSample.routes'
import storeRoutes from './src/features/store/store.routes'
import mediaRoutes from './src/features/media/media.routes'

export default async(app: FastifyInstance)=>{
    app.register(featureSampleRoutes, {prefix:'/featureSample'})
    app.register(storeRoutes, {prefix:'/store'})
    app.register(mediaRoutes, {prefix:'/media'})
}