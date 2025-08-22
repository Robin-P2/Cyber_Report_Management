// src/components/ControlRow.tsx
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


type ControlRowProps = {
    controlData: any; // Using a different prop name to avoid conflict
    speIndex: number;
    subIndex: number;
    controlIndex: number;
};

export const ControlRow = ({ controlData, speIndex, subIndex, controlIndex }: ControlRowProps) => {
    const { control, watch, setValue } = useFormContext();

    const observedRatingFieldName = `spes.${speIndex}.sub_domains.${subIndex}.controls.${controlIndex}.observedRating`;
    const inPlaceFieldName = `spes.${speIndex}.sub_domains.${subIndex}.controls.${controlIndex}.inPlace`;

    const observedRating = watch(observedRatingFieldName);

    useEffect(() => {
        let inPlaceValue: 'Y' | 'N' | 'P' | '' = '';
        if (['4', '5'].includes(observedRating)) {
            inPlaceValue = 'Y';
        } else if (['1', '2', '3'].includes(observedRating)) {
            inPlaceValue = 'P';
        } else if (observedRating === '0') {
            inPlaceValue = 'N';
        }
        setValue(inPlaceFieldName, inPlaceValue);
    }, [observedRating, setValue, inPlaceFieldName]);

    return (
        <div className="p-4 border-b grid grid-cols-3 gap-4 items-start">
            {/* Column 1: Control Name */}
            <div>
                <p className="font-semibold">{controlData.control_name}</p>
                <p className="text-sm text-gray-500">{controlData.control_id}</p>
            </div>

            {/* Column 2: Observed Rating */}
            <FormField
                control={control}
                name={observedRatingFieldName}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Observed Rating</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a rating" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="0">0 - Incomplete</SelectItem>
                                <SelectItem value="1">1 - Initial</SelectItem>
                                <SelectItem value="2">2 - Performed</SelectItem>
                                <SelectItem value="3">3 - Defined</SelectItem>
                                <SelectItem value="4">4 - Quantitatively Managed</SelectItem>
                                <SelectItem value="5">5 - Optimized</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Column 3: In Place? (Automated) */}
            <FormField
                control={control}
                name={inPlaceFieldName}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>In Place?</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="Calculated..." disabled />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
};