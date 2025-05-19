import 'dotenv/config';
import Stripe from 'stripe';
import { handleEvent } from './handleEvent.js';

const exampleTransferReversedEvent = {
  id: 'evt_1QFEAOQM2dPzRG2KNCZ2GhPd',
  object: 'event',
  api_version: '2017-04-06',
  created: 1730203495,
  data: {
    object: {
      id: 'tr_1QFDnSQM2dPzRG2Kfqc6LCq7',
      object: 'transfer',
      amount: 1174,
      amount_reversed: 1174,
      balance_transaction: 'txn_1QFDnSQM2dPzRG2KuM4mlxoz',
      created: 1730202074,
      currency: 'gbp',
      description: null,
      destination: 'acct_1QClJ1BHXYXKy5wR',
      destination_payment: 'py_1QFDnSBHXYXKy5wRUZ7NwFgN',
      livemode: false,
      metadata: {
        sellerStripeAccountId: 'acct_1QClJ1BHXYXKy5wR',
        orderUuid: '74f75272-4957-4314-8903-755ca404e734',
      },
      reversals: {
        object: 'list',
        data: [
          {
            amount: 1174,
            destination_payment_refund: 'pyr_1QFEAMBHXYXKy5wRUEUd8yDF',
            balance_transaction: 'txn_1QFEANQM2dPzRG2Kf8toXU2m',
            created: 1730203495,
            metadata: {},
            object: 'transfer_reversal',
            currency: 'gbp',
            source_refund: null,
            id: 'trr_1QFEANQM2dPzRG2Kp9zF4WfN',
            transfer: 'tr_1QFDnSQM2dPzRG2Kfqc6LCq7',
          },
        ],
        has_more: false,
        total_count: 1,
        url: '/v1/transfers/tr_1QFDnSQM2dPzRG2Kfqc6LCq7/reversals',
      },
      reversed: true,
      source_transaction: 'py_1QFDYaQM2dPzRG2K0JdkKTJa',
      source_type: 'card',
      transfer_group: 'group_py_1QFDYaQM2dPzRG2K0JdkKTJa',
    },
    previous_attributes: {
      amount_reversed: 0,
      reversals: {
        data: [],
        total_count: 0,
      },
      reversed: false,
    },
  },
  livemode: false,
  pending_webhooks: 2,
  request: 'req_S3w4oYyKGv9sum',
  type: 'transfer.reversed',
} as unknown as Stripe.Event;

handleEvent(exampleTransferReversedEvent);
