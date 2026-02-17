import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { StorageModule } from './storage/storage.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { ThemesModule } from './themes/themes.module.js';
import { MessagesModule } from './messages/messages.module.js';
import { RecommendationsModule } from './recommendations/recommendations.module.js';
import { TrendsModule } from './trends/trends.module.js';
import { FeaturedVerbatimsModule } from './featured-verbatims/featured-verbatims.module.js';
import { TransversalModule } from './transversal/transversal.module.js';
import { InvitationsModule } from './invitations/invitations.module.js';
import { ObjectivesModule } from './objectives/objectives.module.js';
import { StrategicActionsModule } from './strategic-actions/strategic-actions.module.js';
import { IrcBreakdownModule } from './irc-breakdown/irc-breakdown.module.js';
import { ResourcesModule } from './resources/resources.module.js';
import { QueueModule } from './queue/queue.module.js';
import { GoogleModule } from './google/google.module.js';
import configuration from './config/configuration.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    StorageModule,
    QueueModule,
    GoogleModule,
    AuthModule,
    ProjectsModule,
    ThemesModule,
    MessagesModule,
    RecommendationsModule,
    TrendsModule,
    FeaturedVerbatimsModule,
    TransversalModule,
    InvitationsModule,
    ObjectivesModule,
    StrategicActionsModule,
    IrcBreakdownModule,
    ResourcesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
