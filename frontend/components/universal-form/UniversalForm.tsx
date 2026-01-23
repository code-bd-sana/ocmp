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
import { UniversalFomrsProps } from "./form.types";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

import { CalendarIcon, X } from "lucide-react";
import { AlertDialogCancel } from "../ui/alert-dialog";

export default function UniversalForm<T extends FieldValues>({
  title,
  fields,
  schema,
  defaultValues,
  onSubmit,
  submitText,
}: UniversalFomrsProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema as ZodType<T, any, any>), // chat-gpt
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const { handleSubmit, control, formState } = methods;
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date | undefined>(
    undefined,
  );

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
        className='space-y-6 bg-white dark:bg-gray-800 px-6  '>
        <div className='flex justify-between'>
          <h2 className='text-2xl text-primary font-semibold pb-2'>{title}</h2>
          <AlertDialogCancel className='border-none shadow-none hover:bg-transparent p-0 hover:text-black dark:hover:text-white'>
            <X />
          </AlertDialogCancel>
        </div>

        {fields.map((field) => (
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
                {...methods.register(field.name as any)} // remove any ---
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
                name={field.name as any} // remove any ---
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
                name={field.name as any} // remove any
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

                  return (
                    <Field>
                      <InputGroup className='border border-gray-[] rounded-none dark:border-gray-600  px-3 py-6 focus:outline-none dark:bg-gray-700 dark:text-white'>
                        <InputGroupInput
                          value={formatDate(selectedDate)}
                          placeholder={field.placeholder || "Select date"}
                          readOnly
                          onKeyDown={(e) => {
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              setDatePickerOpen(true);
                            }
                          }}
                        />

                        <InputGroupAddon align='inline-end'>
                          <Popover
                            open={datePickerOpen}
                            onOpenChange={setDatePickerOpen}>
                            <PopoverTrigger asChild>
                              <InputGroupButton variant='ghost' size='icon-xs'>
                                <CalendarIcon />
                              </InputGroupButton>
                            </PopoverTrigger>

                            <PopoverContent className='p-0' align='end'>
                              <Calendar
                                mode='single'
                                selected={selectedDate}
                                month={calendarMonth ?? selectedDate}
                                onMonthChange={setCalendarMonth}
                                onSelect={(date) => {
                                  controllerField.onChange(date);
                                  setDatePickerOpen(false);
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

            {field.type === "file" && (
              <Controller
                control={control}
                name={field.name as any}
                render={({ field: controllerField }) => {
                  const [previews, setPreviews] = useState<string[]>([]); // move to top level
                  const [isDragging, setIsDragging] = useState(false); // move to top level

                  const handleFiles = (files: FileList | null) => {
                    if (!files) return;
                    controllerField.onChange(field.multiple ? files : files[0]);

                    // Generate previews for images
                    const filePreviews: string[] = [];
                    for (let i = 0; i < files.length; i++) {
                      const file = files[i];
                      if (file.type.startsWith("image/")) {
                        const url = URL.createObjectURL(file);
                        filePreviews.push(url);
                      }
                    }
                    setPreviews(filePreviews);
                  };

                  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFiles(e.dataTransfer.files);
                  };

                  const handleDragOver = (
                    e: React.DragEvent<HTMLDivElement>,
                  ) => {
                    e.preventDefault();
                    setIsDragging(true);
                  };

                  const handleDragLeave = () => setIsDragging(false);

                  return (
                    <>
                      <label>
                        <input
                          type='file'
                          hidden
                          multiple={field.multiple}
                          onChange={(e) => handleFiles(e.target.files)}
                        />

                        <div
                          className={`
                flex flex-col items-center justify-center
                border-2 border-dashed rounded-md h-40 cursor-pointer
                transition text-center
                ${isDragging ? "border-primary bg-primary/10" : "border-gray-300 dark:border-gray-600"}
              `}
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}>
                          {/* Icon */}
                          <div className='w-12 h-12 flex items-center justify-center rounded-full bg-blue-50 mb-2'>
                            <svg
                              className='w-6 h-6 text-primary'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                              viewBox='0 0 24 24'>
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                d='M12 16v-8m0 0l-3 3m3-3l3 3M20 16.5A4.5 4.5 0 0015.5 12h-1.1'
                              />
                            </svg>
                          </div>

                          <p className='text-sm'>
                            <span className='text-primary font-medium'>
                              Click or Drag & Drop
                            </span>{" "}
                            files
                          </p>
                          <p className='text-xs text-gray-500 mt-1'>
                            (Max. File size: 25 MB)
                          </p>
                        </div>
                      </label>

                      {/* Previews */}
                      {previews.length > 0 && (
                        <div className='mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3'>
                          {previews.map((src, idx) => (
                            <div
                              key={idx}
                              className='relative w-full aspect-square border rounded overflow-hidden'>
                              <img
                                src={src}
                                alt={`preview-${idx}`}
                                className='object-cover w-full h-full'
                              />
                              <button
                                type='button'
                                onClick={() => {
                                  // Remove preview
                                  setPreviews((prev) =>
                                    prev.filter((_, i) => i !== idx),
                                  );

                                  if (field.multiple) {
                                    const dt = new DataTransfer();
                                    const files =
                                      controllerField.value as FileList;
                                    for (let i = 0; i < files.length; i++) {
                                      if (i !== idx) dt.items.add(files[i]);
                                    }
                                    controllerField.onChange(dt.files);
                                  } else {
                                    controllerField.onChange(null);
                                  }
                                }}
                                className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs'>
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
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

        <div className='flex gap-4'>
          <AlertDialogCancel className='bg-[#FFDDDD]  border-[#DC3545] text-[#DC3545] py-[19px] hover:bg-[#FFDDDD] hover:text-[#DC3545] rounded-none '>
            Cancel
          </AlertDialogCancel>
          <button
            type='submit'
            disabled={formState.isSubmitting}
            className='bg-primary text-white px-4 py-2 cursor-pointer'>
            {formState.isSubmitting ? "Submitting..." : submitText || "Submit"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
