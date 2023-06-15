import { WishesModule } from '../wishes/wishes.module';
import { EmailSenderModule } from '../emailSender/emailSender.module';
import { UsersModule } from '../users/users.module';

export const offerDependencies = [WishesModule, EmailSenderModule, UsersModule];
