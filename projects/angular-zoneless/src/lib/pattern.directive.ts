import {Directive, effect, inject, input} from '@angular/core';

import {MaskitoDirective} from './maskito.directive';

@Directive({
    selector: '[maskitoPattern]',
    hostDirectives: [MaskitoDirective],
})
export class MaskitoPattern {
    private readonly maskitoDirective = inject(MaskitoDirective, {self: true});
    public readonly maskitoPattern = input.required<RegExp | string>();

    constructor() {
        effect(() => {
            const pattern = this.maskitoPattern();

            this.maskitoDirective.options.set({
                mask: typeof pattern === 'string' ? new RegExp(`^${pattern}$`) : pattern,
            });
        });
    }
}
