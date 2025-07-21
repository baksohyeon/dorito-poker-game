import { logger } from '../index';

describe('SimpleLogger', () => {
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;
    let consoleDebugSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should log info messages correctly', () => {
        logger.info('test message', { data: 'test' });
        expect(consoleLogSpy).toHaveBeenCalledWith('[INFO] test message', { data: 'test' });
    });

    it('should log error messages correctly', () => {
        logger.error('error message', new Error('test error'));
        expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] error message', new Error('test error'));
    });

    it('should log warning messages correctly', () => {
        logger.warn('warning message', { warning: 'test' });
        expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] warning message', { warning: 'test' });
    });

    it('should log debug messages correctly', () => {
        logger.debug('debug message', { debug: 'test' });
        expect(consoleDebugSpy).toHaveBeenCalledWith('[DEBUG] debug message', { debug: 'test' });
    });
}); 