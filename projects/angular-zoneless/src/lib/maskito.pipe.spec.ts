import {ChangeDetectionStrategy, Component} from '@angular/core';
import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it} from '@jest/globals';
import type {MaskitoOptions} from '@maskito/core';

import {MaskitoPipe} from './maskito.pipe';

describe('MaskitoPipe', () => {
    @Component({
        standalone: true,
        imports: [MaskitoPipe],
        template: `
            <div id="pipe">{{ value | maskito: options }}</div>
        `,
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class TestComponent {
        public value: unknown = '12345';
        public options: MaskitoOptions | null = {
            mask: /^\\d+(,\\d{0,2})?$/,
            preprocessors: [
                ({elementState, data}) => {
                    const {value, selection} = elementState;

                    return {
                        elementState: {
                            selection,
                            value: value.replace('.', ','),
                        },
                        data: data.replace('.', ','),
                    };
                },
            ],
        };
    }

    let fixture: ComponentFixture<TestComponent>;
    let component: TestComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({imports: [TestComponent]});
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should format value', () => {
        component.value = '12345.6789';
        fixture.detectChanges();

        expect(getText()).toBe('12345,67');
    });

    it('should treat null as empty string', () => {
        component.value = null;
        fixture.detectChanges();

        expect(getText()).toBe('');
    });

    it('should treat undefined as empty string', () => {
        component.value = undefined;
        fixture.detectChanges();

        expect(getText()).toBe('');
    });

    it('should use default options if null is passed', () => {
        component.options = null;
        component.value = '12345.67';
        fixture.detectChanges();

        expect(getText()).toBe('12345.67');
    });

    function getText(): string {
        return fixture.debugElement.nativeElement
            .querySelector('#pipe')
            .textContent.trim();
    }
});
