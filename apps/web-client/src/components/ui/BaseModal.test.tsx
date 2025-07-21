import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BaseModal from './BaseModal';

describe('BaseModal', () => {
    it('should not render when isOpen is false', () => {
        render(
            <BaseModal isOpen={false} onClose={() => {}}>
                <div>Test Content</div>
            </BaseModal>
        );
        
        const modalContent = screen.queryByText('Test Content');
        expect(modalContent).not.toBeInTheDocument();
    });

    it('should render content when isOpen is true', () => {
        render(
            <BaseModal isOpen={true} onClose={() => {}}>
                <div>Test Content</div>
            </BaseModal>
        );
        
        const modalContent = screen.getByText('Test Content');
        expect(modalContent).toBeInTheDocument();
    });
}); 