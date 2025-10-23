import {Directive, effect, ElementRef, inject, model, untracked} from '@angular/core';
import {DefaultValueAccessor} from '@angular/forms';
import type {MaskitoElementPredicate, MaskitoOptions} from '@maskito/core';
import {
    Maskito,
    MASKITO_DEFAULT_ELEMENT_PREDICATE,
    maskitoTransform,
} from '@maskito/core';

@Directive({
    selector: '[maskito]',
})
export class MaskitoDirective {
    private readonly elementRef: HTMLElement = inject(ElementRef).nativeElement;
    private maskedElement: Maskito | null = null;

    protected readonly initEffect = effect((onCleanup) => {
        const options = this.options();
        const elementPredicate = this.elementPredicate();
        const {elementRef} = this;

        if (!options) {
            return;
        }

        const predicatePromise = Promise.resolve(elementPredicate(elementRef)).then(
            (predicateResult) => {
                if (
                    this.elementPredicate() !== elementPredicate ||
                    this.options() !== options
                ) {
                    return;
                }

                this.maskedElement = new Maskito(predicateResult, options);
            },
        );

        onCleanup(() => {
            void predicatePromise.then(() => {
                this.maskedElement?.destroy();
                this.maskedElement = null;
            });
        });
    });

    public readonly options = model<MaskitoOptions | null>(null, {alias: 'maskito'});
    public readonly elementPredicate = model<MaskitoElementPredicate>(
        MASKITO_DEFAULT_ELEMENT_PREDICATE,
        {alias: 'maskitoElement'},
    );

    constructor() {
        const accessor = inject(DefaultValueAccessor, {self: true, optional: true});

        if (accessor) {
            const original = accessor.writeValue.bind(accessor);

            accessor.writeValue = (value: unknown) => {
                const options = untracked(() => this.options());

                original(
                    options ? maskitoTransform(String(value ?? ''), options) : value,
                );
            };
        }
    }
}
