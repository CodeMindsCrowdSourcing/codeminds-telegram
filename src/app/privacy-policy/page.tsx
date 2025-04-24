'use client';

import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

export default function PrivacyPolicyPage() {
  return (
    <div className='flex h-full flex-col space-y-4 p-8 pt-6'>
      <div className='flex items-center justify-between'>
        <Heading
          title='Privacy Policy'
          description='How we collect, use, and protect your information'
        />
      </div>
      <Separator />
      <div className='space-y-4'>
        <div className='space-y-2'>
          <h2 className='text-xl font-semibold'>1. Information We Collect</h2>
          <p className='text-muted-foreground'>
            We collect the following types of information:
          </p>
          <ul className='text-muted-foreground list-disc pl-6'>
            <li>Account information (email, name)</li>
            <li>Telegram bot tokens and related data</li>
            <li>Usage statistics and analytics</li>
            <li>Communication data</li>
          </ul>
        </div>

        <div className='space-y-2'>
          <h2 className='text-xl font-semibold'>
            2. How We Use Your Information
          </h2>
          <p className='text-muted-foreground'>We use your information to:</p>
          <ul className='text-muted-foreground list-disc pl-6'>
            <li>Provide and maintain our services</li>
            <li>Improve and personalize your experience</li>
            <li>Communicate with you about our services</li>
            <li>Ensure the security of our platform</li>
          </ul>
        </div>

        <div className='space-y-2'>
          <h2 className='text-xl font-semibold'>3. Information Sharing</h2>
          <p className='text-muted-foreground'>
            We do not sell or rent your personal information. We may share your
            information with:
          </p>
          <ul className='text-muted-foreground list-disc pl-6'>
            <li>Service providers who assist in our operations</li>
            <li>Law enforcement when required by law</li>
            <li>Third parties with your consent</li>
          </ul>
        </div>

        <div className='space-y-2'>
          <h2 className='text-xl font-semibold'>4. Data Security</h2>
          <p className='text-muted-foreground'>
            We implement appropriate security measures to protect your
            information from unauthorized access, alteration, or disclosure.
          </p>
        </div>

        <div className='space-y-2'>
          <h2 className='text-xl font-semibold'>5. Your Rights</h2>
          <p className='text-muted-foreground'>You have the right to:</p>
          <ul className='text-muted-foreground list-disc pl-6'>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </div>

        <div className='space-y-2'>
          <h2 className='text-xl font-semibold'>6. Cookies and Tracking</h2>
          <p className='text-muted-foreground'>
            We use cookies and similar technologies to improve your experience
            and collect usage data. You can control cookie settings through your
            browser.
          </p>
        </div>

        <div className='space-y-2'>
          <h2 className='text-xl font-semibold'>7. Children's Privacy</h2>
          <p className='text-muted-foreground'>
            Our service is not intended for children under 13. We do not
            knowingly collect information from children under 13.
          </p>
        </div>

        <div className='space-y-2'>
          <h2 className='text-xl font-semibold'>
            8. Changes to Privacy Policy
          </h2>
          <p className='text-muted-foreground'>
            We may update this privacy policy from time to time. We will notify
            you of any material changes.
          </p>
        </div>

        <div className='space-y-2'>
          <h2 className='text-xl font-semibold'>9. Contact Us</h2>
          <p className='text-muted-foreground'>
            If you have questions about this privacy policy, please contact us
            at privacy@codeminds.cloud
          </p>
        </div>
      </div>
    </div>
  );
}
