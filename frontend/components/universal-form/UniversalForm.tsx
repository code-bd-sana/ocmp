import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  Controller,
  DefaultValues,
  FieldValues,
  FormProvider,
  useForm,
} from "react-hook-form";
import { ZodType } from "zod";
import { Calendar } from "../ui/calendar";
import { Field } from "../ui/field";
import { Input } from "../ui/input";
import { FieldConfig, UniversalFomrsProps } from "./form.types";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

import { CalendarIcon } from "lucide-react";

export default function UniversalForm<T extends FieldValues>({
  title,
  fields,
  schema,
  defaultValues,
  onSubmit,
  submitText,
}: UniversalFomrsProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema as ZodType<T, any, any>),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const { handleSubmit, control, formState } = methods;
  const [date, setDate] = useState<Date | undefined>(undefined);

  function isValidDate(date: Date | undefined) {
    if (!date) {
      return false;
    }
    return !isNaN(date.getTime());
  }

  function formatDate(date: Date | undefined) {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg '>
        <h2 className='text-2xl text-primary font-semibold pb-2'>{title}</h2>

        {fields.map((field: FieldConfig) => (
          <div key={field.name} className='flex flex-col'>
            {/* Label */}
            {field.type !== "checkbox" &&
              field.type !== "switch" &&
              field.type !== "radio" && (
                <label className='  text-xl mb-4 font-medium'>
                  {field.label}
                  {field.required ? (
                    <span className='text-red-500'> *</span>
                  ) : (
                    ""
                  )}
                </label>
              )}

            {/* Text, Email, Password, Number, Date */}
            {(field.type === "text" ||
              field.type === "email" ||
              field.type === "password" ||
              field.type === "number") && (
              <Input
                type={field.type}
                placeholder={field.placeholder}
                {...methods.register(field.name as any)}
                className='border border-gray-[] rounded-none dark:border-gray-600  px-3 py-6 focus:outline-none dark:bg-gray-700 dark:text-white'
              />
            )}

            {/* Textarea */}
            {field.type === "textarea" && (
              <textarea
                placeholder={field.placeholder}
                {...methods.register(field.name as any)}
                className='border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:text-white'
              />
            )}

            {/* Select */}
            {field.type === "select" && (
              <Controller
                control={control}
                name={field.name as any}
                render={({ field: controllerField }) => (
                  <select
                    {...controllerField}
                    className='border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:text-white'>
                    <option value='' disabled>
                      {field.placeholder || "Select an option"}
                    </option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            )}

            {/* Radio */}
            {field.type === "radio" && (
              <Controller
                control={control}
                name={field.name as any}
                render={({ field: controllerField }) => (
                  <div className='flex gap-4'>
                    {field.options?.map((opt) => (
                      <label
                        key={opt.value}
                        className='flex items-center gap-2 cursor-pointer'>
                        <input
                          type='radio'
                          value={opt.value}
                          checked={controllerField.value === opt.value}
                          onChange={() => controllerField.onChange(opt.value)}
                          className='accent-rose-500'
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                )}
              />
            )}

            {/* Checkbox */}
            {field.type === "checkbox" && (
              <Controller
                control={control}
                name={field.name as any}
                render={({ field: controllerField }) => (
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={controllerField.value || false}
                      onChange={(e) =>
                        controllerField.onChange(e.target.checked)
                      }
                      className='accent-rose-500'
                    />
                    {field.label}
                  </label>
                )}
              />
            )}

            {/* Switch */}
            {field.type === "switch" && (
              <Controller
                control={control}
                name={field.name as any}
                render={({ field: controllerField }) => (
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <div
                      onClick={() =>
                        controllerField.onChange(!controllerField.value)
                      }
                      className={`w-10 h-5 rounded-full p-1 flex items-center transition-colors ${
                        controllerField.value
                          ? "bg-rose-500 justify-end"
                          : "bg-gray-300 dark:bg-gray-600 justify-start"
                      }`}>
                      <div className='w-4 h-4 bg-white rounded-full shadow' />
                    </div>
                    {field.label}
                  </label>
                )}
              />
            )}

            {field.type === "date" && (
              <Controller
                control={control}
                name={field.name as any}
                render={({ field: controllerField }) => {
                  const selectedDate = controllerField.value
                    ? new Date(controllerField.value)
                    : undefined;

                  const [open, setOpen] = useState(false);
                  const [month, setMonth] = useState<Date | undefined>(
                    selectedDate,
                  );

                  return (
                    <Field>
                      <InputGroup className='border border-gray-[] rounded-none dark:border-gray-600  px-3 py-6 focus:outline-none dark:bg-gray-700 dark:text-white'>
                        <InputGroupInput
                          value={formatDate(selectedDate)}
                          placeholder={field.placeholder || "Select date"}
                          onChange={(e) => {
                            const date = new Date(e.target.value);
                            if (isValidDate(date)) {
                              controllerField.onChange(date);
                              setMonth(date);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              setOpen(true);
                            }
                          }}
                        />

                        <InputGroupAddon align='inline-end' className=''>
                          <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                              <InputGroupButton
                                variant='ghost'
                                size='icon-xs'
                                aria-label='Select date'>
                                <CalendarIcon />
                                <span className='sr-only'>Select date</span>
                              </InputGroupButton>
                            </PopoverTrigger>

                            <PopoverContent
                              className='w-auto overflow-hidden p-0'
                              align='end'
                              alignOffset={-8}
                              sideOffset={10}>
                              <Calendar
                                mode='single'
                                selected={selectedDate}
                                month={month}
                                onMonthChange={setMonth}
                                onSelect={(date) => {
                                  controllerField.onChange(date);
                                  setOpen(false);
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </InputGroupAddon>
                      </InputGroup>
                    </Field>
                  );
                }}
              />
            )}

            {/* Error Message */}
            {formState.errors[field.name] && (
              <p className='text-red-500 text-sm mt-1'>
                {formState.errors[field.name]?.message as string}
              </p>
            )}
          </div>
        ))}

        {/* Submit Button */}
        <button
          type='submit'
          disabled={formState.isSubmitting}
          className='bg-primary text-white px-4 py-2 '>
          {formState.isSubmitting ? "Submitting..." : submitText || "Submit"}
        </button>
      </form>
    </FormProvider>
  );
}
