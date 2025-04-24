'use client';

import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

export default function TermsOfUsePage() {
  return (
    <div className='flex h-full flex-col space-y-4 p-8 pt-6'>
      <div className='flex items-center justify-between'>
        <Heading
          title='Terms of Use'
          description='Please read these terms carefully before using our service'
        />
      </div>
      <Separator />
      <div className='space-y-4'>
        <div className='space-y-2'>
          <h2 className='text-xl font-semibold'>1. Acceptance of Terms</h2>
          <p className='text-muted-foreground'>
            By accessing and using CodeMinds Telegram Bots service, you agree to
            be bound by these Terms of Use.
          </p>
        </div>

        <div className='space-y-2'>
          <h2 className='text-xl font-semibold'>2. Service Description</h2>
          <p className='text-muted-foreground'>
            CodeMinds provides Telegram bot creation and management services.
            Our platform allows users to create, customize, and manage Telegram
            bots for various purposes.
          </p>
        </div>

        <div className='space-y-2'>
          <h2 className='text-xl font-semibold'>3. User Responsibilities</h2>
          <p className='text-muted-foreground'>Users are responsible for:</p>
          <ul className='text-muted-foreground list-disc pl-6'>
            <li>Maintaining the security of their account</li>
            <li>Complying with Telegram's terms of service</li>
            <li>Using the service in accordance with applicable laws</li>
            <li>Not using the service for any illegal or harmful purposes</li>
          </ul>
        </div>

        <div className='space-y-2'>
          <h2 className='text-xl font-semibold'>4. Service Limitations</h2>
          <p className='text-muted-foreground'>We reserve the right to:</p>
          <ul className='text-muted-foreground list-disc pl-6'>
            <li>Modify or discontinue the service at any time</li>
            <li>Limit access to certain features</li>
            <li>Suspend or terminate accounts that violate these terms</li>
          </ul>
        </div>

        <div className='space-y-2'>
          <h2 className='text-xl font-semibold'>5. Intellectual Property</h2>
          <p className='text-muted-foreground'>
            All content and materials available through our service are
            protected by intellectual property rights. Users may not copy,
            modify, or distribute our content without permission.
          </p>
        </div>

        <div className='space-y-2'>
          <h2 className='text-xl font-semibold'>6. Disclaimer</h2>
          <p className='text-muted-foreground'>
            Our service is provided "as is" without any warranties. We are not
            responsible for any damages or losses resulting from the use of our
            service.
          </p>
        </div>

        <div className='space-y-2'>
          <h2 className='text-xl font-semibold'>7. Changes to Terms</h2>
          <p className='text-muted-foreground'>
            We may update these terms at any time. Continued use of the service
            after changes constitutes acceptance of the new terms.
          </p>
        </div>

        <div className='space-y-2'>
          <h2 className='text-xl font-semibold'>8. Contact Information</h2>
          <p className='text-muted-foreground'>
            For questions about these terms, please contact us at
            support@codeminds.cloud
          </p>
        </div>
      </div>
    </div>
  );
}
