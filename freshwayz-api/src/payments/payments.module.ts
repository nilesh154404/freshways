import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentsReconciliationService } from './payments.reconciliation.service';
import { Payment } from './entities/payment.entity';
import { PaymentLog } from './entities/payment-log.entity';
import { Order } from 'src/orders/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, PaymentLog, Order])],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsReconciliationService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
