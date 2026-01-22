import React from "react";
import { useForm, FormProvider, Controller, FieldValues, Resolver, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UniversalFomrsProps, FieldConfig } from "./form.types";
import { ZodType, ZodTypeAny } from "zod";


// t 

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

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
      >
        <h2 className="text-xl font-semibold">{title}</h2>

        {fields.map((field: FieldConfig) => (
          <div key={field.name} className="flex flex-col">
            {/* Label */}
            {field.type !== "checkbox" &&
              field.type !== "switch" &&
              field.type !== "radio" && (
                <label className="mb-1 font-medium">{field.label}</label>
              )}

            {/* Text, Email, Password, Number, Date */}
            {(field.type === "text" ||
              field.type === "email" ||
              field.type === "password" ||
              field.type === "number" ||
              field.type === "date") && (
              <input
                type={field.type}
                placeholder={field.placeholder}
                {...methods.register(field.name as any)}
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:text-white"
              />
            )}

            {/* Textarea */}
            {field.type === "textarea" && (
              <textarea
                placeholder={field.placeholder}
                {...methods.register(field.name as any)}
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:text-white"
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
                    className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="" disabled>
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
                  <div className="flex gap-4">
                    {field.options?.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          value={opt.value}
                          checked={controllerField.value === opt.value}
                          onChange={() => controllerField.onChange(opt.value)}
                          className="accent-rose-500"
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
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={controllerField.value || false}
                      onChange={(e) =>
                        controllerField.onChange(e.target.checked)
                      }
                      className="accent-rose-500"
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
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() =>
                        controllerField.onChange(!controllerField.value)
                      }
                      className={`w-10 h-5 rounded-full p-1 flex items-center transition-colors ${
                        controllerField.value
                          ? "bg-rose-500 justify-end"
                          : "bg-gray-300 dark:bg-gray-600 justify-start"
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow" />
                    </div>
                    {field.label}
                  </label>
                )}
              />
            )}

            {/* Error Message */}
            {formState.errors[field.name] && (
              <p className="text-red-500 text-sm mt-1">
                {formState.errors[field.name]?.message as string}
              </p>
            )}
          </div>
        ))}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={formState.isSubmitting}
          className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600 disabled:opacity-50"
        >
          {formState.isSubmitting ? "Submitting..." : submitText || "Submit"}
        </button>
      </form>
    </FormProvider>
  );
}
